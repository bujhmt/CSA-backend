import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../database/services/prisma.service';
import {ActionLog} from '../../database/interfaces/action-log.interface';

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
    }: {
        type: string,
        userId: string,
        civilStatusActId?: string,
        oldSnapshot?: Record<string, any>,
        newSnapshot?: Record<string, any>
    }): Promise<Partial<ActionLog>> {
        return this.prismaService.actionLog.create({
            data: {
                type,
                newSnapshot,
                oldSnapshot,
                user: {connect: {id: userId}},
                civilStatusAct: {connect: {id: civilStatusActId}},
            },
        });
    }
}
