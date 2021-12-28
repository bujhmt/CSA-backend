import {Injectable, UnauthorizedException} from '@nestjs/common';
import {Role} from '@prisma/client';
import {PrismaService} from '../../database/services/prisma.service';
import {CivilStatusAct, Prisma} from '.prisma/client';
import {User} from '../../database/interfaces/user.interface';

@Injectable()
export class CivilActService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

    async getUserCivilActs(registrator: Pick<User, 'id'>, userId: string): Promise<[CivilStatusAct[], number]> {
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
        const where: Prisma.CivilStatusActWhereInput = {passportData: {owner: {id: userId}}};

        return Promise.all([
            this.prismaService.civilStatusAct.findMany({where}),
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

        return this.prismaService.civilStatusAct.findUnique({where: {id: actId}});
    }

    async updateUserCivilAct(
        registrator: Pick<User, 'id'>,
        userId: string,
        civilActId: string,
        newData: Record<string, string>,
        isActive: boolean,
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
            this.prismaService.civilStatusAct.findUnique({where: {id: civilActId}}),
            this.prismaService.civilStatusAct.update({
                where: {id: civilActId},
                data: {data: newData, isActive},
            }),
        ]);

        return {
            oldSnapshot,
            newSnapshot,
        };
    }
}
