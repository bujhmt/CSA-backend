import {Injectable} from '@nestjs/common';
import {User} from '@prisma/client';
import {PrismaService} from '../../database/services/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    create(user: User) {
        const newUser = this.prismaService.user.create({data: {...user}});
        return newUser;
    }

    getUsers(): Promise<Partial<User>[]> {
        return this.prismaService.user.findMany({
            select: {
                email: true,
                login: true,
            },
        });
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
