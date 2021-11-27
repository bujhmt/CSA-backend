import {User} from '.prisma/client';

export interface CreateUserDTO extends User {
    password: string;
}
