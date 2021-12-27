import {Injectable, UnauthorizedException} from '@nestjs/common';
import {randomInt} from 'crypto';
import * as fs from 'fs';
import {IssuedDocStatus, Role} from '@prisma/client';
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

    public getBySerialCode(serialCode: number): Promise<Partial<IssuedDocument>> {
        return this.prismaService.issuedDocument.findUnique({
            select: {
                status: true,
                type: true,
                serialCode: true,
                register: {select: {name: true}},
                requester: {select: {name: true}},
                requestDate: true,
                processedDate: true,
            },
            where: {serialCode},
        });
    }

    public getUserIssuedDocs(user: Partial<User>): Promise<[Partial<IssuedDocument>[], number]> {
        const where: Prisma.IssuedDocumentWhereInput = user.role === 'USER' ? {requesterId: user.id} : {};

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

    public async getUserIssuedDoc(
        registrator: Pick<User, 'id'>,
        serialCode: number,
    ):
    Promise<Partial<IssuedDocument>> {
        const isRegister = await this.prismaService.user.findUnique({
            where: {id: registrator.id},
            select: {
                id: true,
                role: true,
                isActive: true,
            },
        });

        if (isRegister.role !== Role.REGISTER || !isRegister.isActive) {
            throw new UnauthorizedException();
        }

        return this.prismaService.issuedDocument.findFirst({
            include: {requester: {include: {userDocuments: true, passportData: true}}},
            where: {serialCode},
        });
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

    public async addIssuedDocsResponse(
        registrator: Pick<User, 'id'>,
        serialCode: number,
        file: Express.Multer.File,
    ) {
        const isRegister = await this.prismaService.user.findUnique({
            where: {id: registrator.id},
            select: {
                id: true,
                role: true,
                isActive: true,
            },
        });

        if (isRegister.role !== Role.REGISTER || !isRegister.isActive) {
            throw new UnauthorizedException();
        }

        return (await this.prismaService.issuedDocument.updateMany({
            where: {serialCode},
            data: {
                processedResult: file.filename,
                status: IssuedDocStatus.PROCESSED,
                processedDate: new Date(Date.now()),
            },
        }))[0];
    }

    public async setDocStatus(
        registrator: Pick<User, 'id'>,
        serialCode: number,
        status: IssuedDocStatus,
    ) {
        const isRegister = await this.prismaService.user.findUnique({
            where: {id: registrator.id},
            select: {
                id: true,
                role: true,
                isActive: true,
            },
        });
        if (isRegister.role !== Role.REGISTER || !isRegister.isActive) {
            throw new UnauthorizedException();
        }
        return this.prismaService.issuedDocument.update({
            where: {serialCode},
            data: {status},
        });
    }

    public generateReceipt() {
        return fs.createReadStream('./mock.pdf');
    }
}
