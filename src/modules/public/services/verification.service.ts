import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../database/services/prisma.service';
import {User} from '../../database/interfaces/user.interface';

@Injectable()
export class VerificationService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {
    }

    public async getUserVerification({id}: Partial<User>): Promise<boolean> {
        const {userDocuments, passportData} = await this.prismaService.user.findUnique({
            where: {id},
            select: {
                userDocuments: true,
                passportData: {
                    select: {
                        taxpayerIdentificationNumber: true,
                        document: true,
                    },
                },
            },
        });

        return !!userDocuments.length && !!passportData?.document;
    }
}
