import {
    Controller, Get, Logger, UseGuards, Request,
} from '@nestjs/common';
import {JwtAuthGuard} from 'src/modules/auth/guards/jwt-auth.guard';
import {IssuedDoctument} from '.prisma/client';
import {IssuedDocsService} from '../services/issued-docs.service';
import {AuthorizedRequest} from '../../../interfaces/authorized-request.interface';
import {Answer} from '../../../interfaces/answer.interface';

@Controller('/issued-docs')
@UseGuards(JwtAuthGuard)
export class IssuedDocsController {
    private readonly logger = new Logger(IssuedDocsController.name);

    constructor(
        private readonly issuedDocsService: IssuedDocsService,
    ) {
    }

    @Get('/')
    async getIssuedDocs(@Request() {user}: AuthorizedRequest): Promise<Answer<Partial<IssuedDoctument>[]>> {
        try {
            const [data, total] = await this.issuedDocsService.getUserIssuedDocs(user);

            return {success: true, data, total};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }
}
