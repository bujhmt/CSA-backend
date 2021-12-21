import {
    Controller, Get, Logger, UseGuards, Request, UseInterceptors, Post, Body,
} from '@nestjs/common';
import {JwtAuthGuard} from 'src/modules/auth/guards/jwt-auth.guard';
import {format} from 'date-fns';
import {IssuedDocsService} from '../services/issued-docs.service';
import {AuthorizedRequest} from '../../../interfaces/authorized-request.interface';
import {Answer} from '../../../interfaces/answer.interface';
import {IssuedDocument} from '../../database/interfaces/issued-document.interface';
import {FieldTransformInterceptor} from '../../../interceptors/field-transform.interceptor';

@Controller('/issued-docs')
@UseGuards(JwtAuthGuard)
export class IssuedDocsController {
    private readonly logger = new Logger(IssuedDocsController.name);

    constructor(
        private readonly issuedDocsService: IssuedDocsService,
    ) {
    }

    @Get('/')
    @UseInterceptors(
        new FieldTransformInterceptor<string | Date, string>({
            field: 'requestDate',
            recursive: true,
            handler: (date) => format(new Date(date), 'dd.MM.yyyy'),
        }),
    )
    async getIssuedDocs(@Request() {user}: AuthorizedRequest): Promise<Answer<Partial<IssuedDocument>[]>> {
        try {
            const [data, total] = await this.issuedDocsService.getUserIssuedDocs(user);

            return {success: true, data, total};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }

    @Post('/request')
    async addIssuedDocsRequest(@Request() {user}: AuthorizedRequest, @Body() {type}:
    {type: string}):
    Promise<Answer<Partial<IssuedDocument>>> {
        try {
            const data = await this.issuedDocsService.addIssuedDocsRequest(user, type);

            return {success: true, data};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }
}
