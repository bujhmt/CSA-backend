import {User as UserModel} from '.prisma/client';

export interface User extends UserModel {
    name: string;
}
