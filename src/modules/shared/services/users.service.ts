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
                isActive: true,
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
                isActive: true,
            },
        });
    }

    async addFiles(
        user: Pick<User, 'id'>,
        files: Array<Express.Multer.File>,
    ): Promise<Partial<User>> {
        const isUser = await this.prismaService.user.findUnique({
            where: {id: user.id},
            select: {id: true, isActive: true},
        });
        if (!isUser || !isUser.isActive) {
            throw new UnauthorizedException();
        }

        await Promise.all(files.map((file) => this.prismaService.userDocument.create({
            data: {
                document: file.filename,
                user: {connect: {id: user.id}},
            },
            select: {id: true},
        })));

        return isUser;
    }

    async addInfo(
        user: Pick<User, 'id'>,
        addInfoData: AddInfoDTO,
    ): Promise<Partial<User>> {
        const isUser = await this.prismaService.user.findUnique({
            where: {id: user.id},
            include: {passportData: true},
        });
        if (!isUser || !isUser.isActive) {
            throw new UnauthorizedException();
        }

        const updatedUser = await this.prismaService.user.update({
            where: {id: user.id},
            data: {
                name: addInfoData.name,
                passportData: isUser.passportData ? {
                    update: {
                        document: addInfoData.document,
                        record: addInfoData.record,
                        taxpayerIdentificationNumber: addInfoData.taxpayerIdentificationNumber,
                        // issuingAuthorityId: parseInt(addInfoData.issuingAuthority, 10),
                    },
                } : {
                    create: {
                        document: addInfoData.document,
                        record: addInfoData.record,
                        taxpayerIdentificationNumber: addInfoData.taxpayerIdentificationNumber,
                        // issuingAuthorityId: parseInt(addInfoData.issuingAuthority, 10),
                    },
                },
            },
            select: {id: true},
        });
        return updatedUser;
    }

    async getInfo(registrator: Pick<User, 'id'>, userId: string): Promise<Partial<User> & {
        passportData: Partial<PassportData>;
    }> {
        const isRegister = await this.getUserById(registrator.id);
        if (isRegister.role !== Role.REGISTER || !isRegister.isActive) {
            throw new UnauthorizedException();
        }
        const userData = await this.prismaService.user.findUnique({
            where: {id: userId},
            include: {passportData: true},
        });
        return {
            name: userData.name,
            passportData: {
                issuingAuthorityId: userData.passportData.issuingAuthorityId,
                record: userData.passportData.record,
                document: userData.passportData.document,
                taxpayerIdentificationNumber: userData.passportData.taxpayerIdentificationNumber,
            },
        };
    }

    async getFiles(registrator: Pick<User, 'id'>, userId: string): Promise<string[]> {
        const isRegister = await this.getUserById(registrator.id);
        if (isRegister.role !== Role.REGISTER || !isRegister.isActive) {
            throw new UnauthorizedException();
        }
        const {userDocuments: docs} = await this.prismaService.user.findUnique({
            where: {id: userId},
            include: {userDocuments: true},
        });
        return docs.map((doc) => doc.document);
    }

    async deactivateUser(admin: Pick<User, 'id'>, login: string): Promise<Partial<User>> {
        const isAdmin = await this.getUserById(admin.id);
        if (isAdmin.role !== Role.ADMIN || !isAdmin.isActive) {
            throw new UnauthorizedException();
        }
        const deactivatedUser = await this.prismaService.user.update({
            where: {login},
            data: {isActive: false},
        });
        return deactivatedUser;
    }
}
