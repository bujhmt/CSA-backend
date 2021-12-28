import {Injectable, UnauthorizedException} from '@nestjs/common';
import {Role} from '@prisma/client';
import {PrismaService} from '../../database/services/prisma.service';
import {ActType, CivilStatusAct, Prisma} from '.prisma/client';
import {User} from '../../database/interfaces/user.interface';
import {CreateCivilActDTO} from '../dto/civil-act/create-civil-act.dto';

@Injectable()
export class CivilActService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

    async getUserCivilActs(registrator: Pick<User, 'id'>, login: string): Promise<[CivilStatusAct[], number]> {
        const isRegister = await this.prismaService.user.findUnique({
            where: {id: registrator.id},
            select: {
                id: true,
                role: true,
                isActive: true,
            },
        });

        if (isRegister.role !== Role.REGISTER || !isRegister.isActive) {
            throw new UnauthorizedException();
        }
        const {id: userId} = await this.prismaService.user.findUnique({where: {login}, select: {id: true}});
        const where: Prisma.CivilStatusActWhereInput = {passportData: {owner: {id: userId}}};

        return Promise.all([
            this.prismaService.civilStatusAct.findMany({
                where,
                include: {actType: true},
            }),
            this.prismaService.civilStatusAct.count({where}),
        ]);
    }

    async getCivilAct(registrator: Pick<User, 'id'>, actId: string): Promise<CivilStatusAct> {
        const isRegister = await this.prismaService.user.findUnique({
            where: {id: registrator.id},
            select: {
                id: true,
                role: true,
                isActive: true,
            },
        });

        if (isRegister.role !== Role.REGISTER || !isRegister.isActive) {
            throw new UnauthorizedException();
        }

        return this.prismaService.civilStatusAct.findUnique({
            where: {id: actId},
            include: {actType: true},
        });
    }

    async marriageCivilAct({actType, data}: CreateCivilActDTO): Promise<CivilStatusAct> {
        // const [husbandPassData, wifePassData] = await Promise.all([
        //     this.prismaService.passportData.findUnique({
        //         where: {document: data.husbandDocument},
        //         include: {owner: true},
        //     }),
        //     this.prismaService.passportData.findUnique({
        //         where: {document: data.wifeDocument},
        //         include: {owner: true},
        //     })]);
        await this.prismaService.civilStatusAct.create({
            data: {
                data,
                isActive: true,
                actType: {connect: {typeName: actType}},
                passportData: {connect: {document: data.husbandDocument}},
            },
            include: {actType: true},
        });
        return this.prismaService.civilStatusAct.create({
            data: {
                data,
                isActive: true,
                actType: {connect: {typeName: actType}},
                passportData: {connect: {document: data.wifeDocument}},
            },
            include: {actType: true},
        });
    }

    async createUserCivilAct(
        registrator: Pick<User, 'id'>,
        {actType, login, data}: CreateCivilActDTO,
    ):
        Promise<CivilStatusAct> {
        const isRegister = await this.prismaService.user.findUnique({
            where: {id: registrator.id},
            select: {
                id: true,
                role: true,
                isActive: true,
            },
        });

        if (isRegister.role !== Role.REGISTER || !isRegister.isActive) {
            throw new UnauthorizedException();
        }
        const user = await this.prismaService.user.findUnique({
            where: {login},
            select: {passportData: true, name: true},
        });
        switch (actType) {
        case 'nameChange':
            await this.prismaService.user.update({
                where: {login},
                data: {name: data.newName},
            });
            return this.prismaService.civilStatusAct.create({
                data: {
                    data: {
                        newName: data.newName,
                        oldName: user.name,
                    },
                    isActive: true,
                    actType: {connect: {typeName: actType}},
                    passportData: {connect: {id: user.passportData.id}},
                },
                include: {actType: true},
            });
        case 'marriage':
            return this.marriageCivilAct({actType, login, data});
        default:
            return this.prismaService.civilStatusAct.create({
                data: {
                    data,
                    isActive: true,
                    actType: {connect: {typeName: actType}},
                    passportData: {connect: {id: user.passportData.id}},
                },
                include: {actType: true},
            });
        }
    }

    async revertNameBack(
        civilActId: string,
        isActive: boolean,
    ) {
        const act = await this.prismaService.civilStatusAct.findUnique({
            where: {id: civilActId},
            select: {
                data: true,
                passportData: {include: {owner: true}},
            },
        });

        await this.prismaService.user.update({
            where: {id: act.passportData.owner.id},
            data: {
                name: isActive
                    ? (act.data as Prisma.JsonObject).newName as string
                    : (act.data as Prisma.JsonObject).oldName as string,
            },
        });
    }

    async updateUserCivilAct(
        registrator: Pick<User, 'id'>,
        civilActId: string,
        isActive: boolean,
        newData?: Record<string, string>,
    ) {
        const isRegister = await this.prismaService.user.findUnique({
            where: {id: registrator.id},
            select: {
                id: true,
                role: true,
                isActive: true,
            },
        });

        if (isRegister.role !== Role.REGISTER || !isRegister.isActive) {
            throw new UnauthorizedException();
        }

        const [oldSnapshot, newSnapshot] = await Promise.all([
            this.prismaService.civilStatusAct.findUnique({where: {id: civilActId}, include: {actType: true}}),
            this.prismaService.civilStatusAct.update({
                where: {id: civilActId},
                data: {data: newData, isActive},
            }),
        ]);

        if (oldSnapshot.actType.typeName === 'nameChange') {
            this.revertNameBack(civilActId, isActive);
        }

        return {
            oldSnapshot,
            newSnapshot,
        };
    }
}
