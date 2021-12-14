import {
    Controller, Get, Logger, UseGuards, Request,
} from '@nestjs/common';
import {JwtAuthGuard} from 'src/modules/auth/guards/jwt-auth.guard';
import {IssuedDocsService} from '../services/issued-docs.service';
import {AuthorizedRequest} from '../../../interfaces/authorized-request.interface';
import {Answer} from '../../../interfaces/answer.interface';
import {IssuedDocument} from '../../database/interfaces/issued-document.interface';

@Controller('/issued-docs')
@UseGuards(JwtAuthGuard)
export class IssuedDocsController {
    private readonly logger = new Logger(IssuedDocsController.name);

    constructor(
        private readonly issuedDocsService: IssuedDocsService,
    ) {
    }

    @Get('/')
    async getIssuedDocs(@Request() {user}: AuthorizedRequest): Promise<Answer<Partial<IssuedDocument>[]>> {
        try {
            const [data, total] = await this.issuedDocsService.getUserIssuedDocs(user);

            return {success: true, data, total};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }
}
