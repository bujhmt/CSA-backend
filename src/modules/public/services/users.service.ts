import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../database/services/prisma.service';
import {User} from '../../database/interfaces/user.interface';

@Injectable()
export class UsersService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

    getUsers(): Promise<Partial<User>[]> {
        return this.prismaService.user.findMany({
            select: {
                email: true,
                name: true,
            },
        });
    }
}
