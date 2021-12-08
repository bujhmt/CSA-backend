import {
    Controller, Get, Logger, UseGuards, Request, InternalServerErrorException,
} from '@nestjs/common';
import {JwtAuthGuard} from 'src/modules/auth/guards/jwt-auth.guard';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime';
import {IssuedDoctument} from '.prisma/client';
import {User} from '../../database/interfaces/user.interface';
import {IssuedDocsService} from '../services/issued-docs.service';

@Controller('/issued')
export class IssuedController {
    private readonly logger = new Logger(IssuedController.name);

    constructor(
        private readonly issuedDocsService: IssuedDocsService,
    ) {
    }

    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getIssuedDocs(@Request() {user}: Request & {user: User}): Promise<Partial<IssuedDoctument>[]> {
        try {
            const data = await this.issuedDocsService.getUserIssuedDocs(user);

            return data;
        } catch (err: unknown) {
            if (err instanceof PrismaClientKnownRequestError) {
                this.logger.error(err.message);
                throw new InternalServerErrorException();
            }
        }
    }
}
