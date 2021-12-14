import {Injectable} from '@nestjs/common';
import {IssuedDoctument, User} from '@prisma/client';
import {PrismaService} from '../../database/services/prisma.service';
import {Prisma} from '.prisma/client';

@Injectable()
export class IssuedDocsService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

    public getUserIssuedDocs(user: User): Promise<[Partial<IssuedDoctument>[], number]> {
        const where: Prisma.IssuedDoctumentWhereInput = {requesterId: user.id};

        return Promise.all([
            this.prismaService.issuedDoctument.findMany({
                select: {
                    serialCode: true,
                    type: true,
                    requestDate: true,
                    processedDate: true,
                    status: true,
                },
                where,
            }),
            this.prismaService.issuedDoctument.count({where}),
        ]);
    }
}
