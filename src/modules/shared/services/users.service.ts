import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportData, Role, User} from '@prisma/client';
import {AddInfoDTO} from 'src/modules/public/dto/add-info.dto';
import {PrismaService} from '../../database/services/prisma.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {}

    create(user: {passwordHash: string, login: string, role: Role}) {
        return this.prismaService.user.create({data: {...user}});
    }

    getUserByEmail(email: string): Promise<Partial<User>> {
        return this.prismaService.user.findUnique({
            where: {email},
            select: {
                id: true,
                login: true,
                passwordHash: true,
                role: true,
            },
        });
    }

    getUserByLogin(login: string): Promise<Partial<User>> {
        return this.prismaService.user.findUnique({
            where: {login},
            select: {
                id: true,
                login: true,
                passwordHash: true,
                role: true,
            },
        });
    }

    getUserById(id: string): Promise<Partial<User>> {
        return this.prismaService.user.findUnique({
            where: {id},
            select: {
                id: true,
                login: true,
                passwordHash: true,
                role: true,
            },
        });
    }

    async addInfo(
        user: Pick<User, 'id'>,
        addInfoData: AddInfoDTO,
        files: Array<Express.Multer.File>,
    ): Promise<Partial<User>> {
        const isUser = await this.prismaService.user.findUnique({
            where: {id: user.id},
            include: {passportData: true},
        });
        if (!isUser) {
            throw new UnauthorizedException();
        }

        await Promise.all(files.map((file) => this.prismaService.userDocument.create({
            data: {
                document: file.filename,
                user: {connect: {id: user.id}},
            },
            select: {id: true},
        })));

        const updatedUser = await this.prismaService.user.update({
            where: {id: user.id},
            data: {
                firstName: addInfoData.firstName,
                lastName: addInfoData.lastName,
                middleName: addInfoData.middleName,
                passportData: isUser.passportData ? {
                    update: {
                        passportNumber: addInfoData.passportNumber,
                        record: addInfoData.record,
                        taxpayerIdentificationNumber: addInfoData.taxpayerIdentificationNumber,
                        issuingAuthorityId: parseInt(addInfoData.issuingAuthority, 10),
                    },
                } : {
                    create: {
                        passportNumber: addInfoData.passportNumber,
                        record: addInfoData.record,
                        taxpayerIdentificationNumber: addInfoData.taxpayerIdentificationNumber,
                        issuingAuthorityId: parseInt(addInfoData.issuingAuthority, 10),
                    },
                },
            },
            select: {id: true},
        });
        return updatedUser;
    }

    async getInfo(admin: Pick<User, 'id'>, userId: string): Promise<Partial<User> & {
        passportData: Partial<PassportData>;
    }> {
        const {role: isRegister} = await this.getUserById(admin.id);
        if (isRegister !== Role.REGISTER) {
            throw new UnauthorizedException();
        }
        const userData = await this.prismaService.user.findUnique({
            where: {id: userId},
            include: {passportData: true},
        });
        return {
            firstName: userData.firstName,
            middleName: userData.middleName,
            lastName: userData.lastName,
            passportData: {
                issuingAuthorityId: userData.passportData.issuingAuthorityId,
                passportNumber: userData.passportData.passportNumber,
                record: userData.passportData.record,
                taxpayerIdentificationNumber: userData.passportData.taxpayerIdentificationNumber,
            },
        };
    }

    async getFiles(admin: Pick<User, 'id'>, userId: string): Promise<string[]> {
        const {role: isRegister} = await this.getUserById(admin.id);
        if (isRegister !== Role.REGISTER) {
            throw new UnauthorizedException();
        }
        const {userDocuments: docs} = await this.prismaService.user.findUnique({
            where: {id: userId},
            include: {userDocuments: true},
        });
        return docs.map((doc) => doc.document);
    }
}
