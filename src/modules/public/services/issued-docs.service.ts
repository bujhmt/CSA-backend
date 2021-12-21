import {Injectable} from '@nestjs/common';
import {randomInt} from 'crypto';
import * as fs from 'fs';
import {PrismaService} from '../../database/services/prisma.service';
import {Prisma} from '.prisma/client';
import {User} from '../../database/interfaces/user.interface';
import {IssuedDocument} from '../../database/interfaces/issued-document.interface';

@Injectable()
export class IssuedDocsService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

    public getUserIssuedDocs(user: Partial<User>): Promise<[Partial<IssuedDocument>[], number]> {
        const where: Prisma.IssuedDocumentWhereInput = {requesterId: user.id};

        return Promise.all([
            this.prismaService.issuedDocument.findMany({
                select: {
                    serialCode: true,
                    type: true,
                    requestDate: true,
                    processedDate: true,
                    status: true,
                },
                where,
            }),
            this.prismaService.issuedDocument.count({where}),
        ]);
    }

    public async addIssuedDocsRequest(
        user: Partial<User>,
        type: string,
    ): Promise<Partial<IssuedDocument>> {
        return this.prismaService.issuedDocument.create({
            data: {
                serialCode: randomInt(1000000),
                type,
                requester: {connect: {id: user.id}},
            },
        });
    }

    public generateReceipt() {
        return fs.createReadStream('./mock.pdf');
    }
}
