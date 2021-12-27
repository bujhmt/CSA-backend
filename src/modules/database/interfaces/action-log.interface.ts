import {ActionLog as ActionLogModel} from '.prisma/client';
import {User} from './user.interface';

export interface ActionLog extends ActionLogModel {
    user: Partial<User>;
    civilStatusAct: Record<string, any>;
}
