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

<<<<<<< HEAD
    public async getAllIssuedDocs(registrator: Partial<User>): Promise<[Partial<IssuedDocument>[], number]> {
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
        return Promise.all([
            this.prismaService.issuedDocument.findMany({
                select: {
                    serialCode: true,
                    type: true,
                    requestDate: true,
                    processedDate: true,
                    status: true,
                },
            }),
            this.prismaService.issuedDocument.count({}),
        ]);
    }

    public async getUserIssuedDoc(
        registrator: Pick<User, 'id'>,
        userId: string,
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

        // this.prismaService.user.findUnique({
        //     where: {id: userId},
        //     include: {
        //         passportData: true,
        //         userDocuments: true,
        //     },
        // });

        return this.prismaService.issuedDocument.findFirst({
=======
    public async getIssuedDoc(
        serialCode: number,
    ): Promise<Partial<IssuedDocument>> {
        return this.prismaService.issuedDocument.findUnique({
>>>>>>> 585353b47089718f599b219f1bd705108e703bb7
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
        return this.prismaService.issuedDocument.update({
            where: {serialCode},
            data: {
                processedResult: file.filename,
                status: IssuedDocStatus.RECEIVED,
                processedDate: new Date(Date.now()),
            },
        });
    }

    public generateReceipt() {
        return fs.createReadStream('./mock.pdf');
    }
}
