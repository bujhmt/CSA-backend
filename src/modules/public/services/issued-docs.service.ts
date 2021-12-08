import {Injectable} from '@nestjs/common';
import {IssuedDoctument, User} from '@prisma/client';
import {PrismaService} from '../../database/services/prisma.service';

@Injectable()
export class IssuedDocsService {
    constructor(private readonly prismaService: PrismaService) {}

    getUserIssuedDocs(user: User): Promise<Partial<IssuedDoctument>[]> {
        return this.prismaService.issuedDoctument.findMany({
            where: {requesterId: user.id},
            select: {
                id: true,
                serialCode: true,
                type: true,
                requestDate: true,
                processedDate: true,
                status: true,
            },
        });
    }
}
