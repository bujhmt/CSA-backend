import {Injectable} from '@nestjs/common';
import {User} from '@prisma/client';
import {PrismaService} from '../../database/services/prisma.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {}

    create(user: {passwordHash: string, login: string}) {
        return this.prismaService.user.create({data: {...user}});
    }

    getUserByEmail(email: string): Promise<Partial<User>> {
        return this.prismaService.user.findUnique({
            where: {email},
            select: {
                email: true,
                passwordHash: true,
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
            },
        });
    }

    getUserById(id: string): Promise<Partial<User>> {
        return this.prismaService.user.findUnique({
            where: {id},
            select: {
                email: true,
                passwordHash: true,
            },
        });
    }
}
