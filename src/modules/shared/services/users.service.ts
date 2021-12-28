import {Injectable} from '@nestjs/common';
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
                name: true,
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

        return this.prismaService.user.update({
            where: {id: user.id},
            data: {
                passportData: isUser.passportData ? {
                    update: {
                        document: addInfoData.document,
                        record: addInfoData.record,
                        taxpayerIdentificationNumber: addInfoData.taxpayerIdentificationNumber,
                    },
                } : {
                    create: {
                        document: addInfoData.document,
                        record: addInfoData.record,
                        taxpayerIdentificationNumber: addInfoData.taxpayerIdentificationNumber,
                    },
                },
            },
            select: {id: true},
        });
    }

    async getInfo(registrator: Pick<User, 'id'>, userId: string): Promise<Partial<User> & {
        passportData: Partial<PassportData>;
    }> {
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
        const {userDocuments: docs} = await this.prismaService.user.findUnique({
            where: {id: userId},
            include: {userDocuments: true},
        });
        return docs.map((doc) => doc.document);
    }

    deactivateUser(admin: Pick<User, 'id'>, login: string): Promise<Partial<User>> {
        return this.prismaService.user.update({
            where: {login},
            data: {isActive: false},
        });
    }

    activateUser(admin: Pick<User, 'id'>, login: string): Promise<Partial<User>> {
        return this.prismaService.user.update({
            where: {login},
            data: {isActive: true},
        });
    }
}
