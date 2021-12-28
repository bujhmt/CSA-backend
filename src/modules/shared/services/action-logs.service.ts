import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../database/services/prisma.service';
import {ActionLog} from '../../database/interfaces/action-log.interface';
import {GetActionLogsDto} from '../../public/dto/action-logs/get-action-logs.dto';
import {Prisma} from '.prisma/client';

@Injectable()
export class ActionLogsService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

    public makeLog({
        type,
        userId,
        civilStatusActId,
        oldSnapshot,
        newSnapshot,
        reason,
    }: {
        type: string,
        userId: string,
        civilStatusActId?: string,
        oldSnapshot?: Record<string, any>,
        newSnapshot?: Record<string, any>,
        reason?: string,
    }): Promise<Partial<ActionLog>> {
        return this.prismaService.actionLog.create({
            data: {
                type,
                newSnapshot,
                oldSnapshot,
                user: {connect: {id: userId}},
                ...(civilStatusActId ? {civilStatusAct: {connect: {id: civilStatusActId}}} : {}),
                reason,
            },
        });
    }

    public list({
        take, role, name, skip, type,
    }: GetActionLogsDto): Promise<[Partial<ActionLog>[], number]> {
        const where: Prisma.ActionLogWhereInput = {
            user: {
                ...(name ? {
                    OR: [
                        {name: {contains: name, mode: 'insensitive'}},
                        {login: {contains: name, mode: 'insensitive'}},
                    ],
                } : {}),
                role,
            },
            ...(type ? {type} : {}),
        };

        return Promise.all([
            this.prismaService.actionLog.findMany({
                where,
                select: {
                    user: {
                        select: {
                            name: true,
                            login: true,
                        },
                    },
                    date: true,
                    type: true,
                    id: true,
                },
                skip,
                take,
                orderBy: {date: 'desc'},
            }),
            this.prismaService.actionLog.count({where}),
        ]);
    }

    public getById(id: string): Promise<Partial<ActionLog>> {
        return this.prismaService.actionLog.findUnique({
            where: {id},
            select: {
                user: {
                    select: {
                        name: true,
                        login: true,
                        isActive: true,
                    },
                },
                type: true,
                date: true,
                oldSnapshot: true,
                newSnapshot: true,
            },
        });
    }
}
