import {User} from '@prisma/client';

export interface CreateUserToken {
    user: Omit<User, 'passwordHash'>;
    token: string;
}
