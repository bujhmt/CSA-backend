import {
    Controller, Get, Logger, UseGuards, Request, UseInterceptors, Post, Body, Query,
} from '@nestjs/common';
import {JwtAuthGuard} from 'src/modules/auth/guards/jwt-auth.guard';
import {format} from 'date-fns';
import {FileInterceptor} from '@nestjs/platform-express';
import {IssuedDocsService} from '../services/issued-docs.service';
import {AuthorizedRequest} from '../../../interfaces/authorized-request.interface';
import {Answer} from '../../../interfaces/answer.interface';
import {IssuedDocument} from '../../database/interfaces/issued-document.interface';
import {FieldTransformInterceptor} from '../../../interceptors/field-transform.interceptor';
import {FileExtender} from '../interceptors/file-extender.interceptor';

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

    @Get('/all')
    @UseInterceptors(
        new FieldTransformInterceptor<string | Date, string>({
            field: 'requestDate',
            recursive: true,
            handler: (date) => format(new Date(date), 'dd.MM.yyyy'),
        }),
    )
    async getAllIssuedDocs(@Request() {user}: AuthorizedRequest): Promise<Answer<Partial<IssuedDocument>[]>> {
        try {
            const [data, total] = await this.issuedDocsService.getAllIssuedDocs(user);

            return {success: true, data, total};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }

    @Post('/request')
    @UseInterceptors(
        new FieldTransformInterceptor<string | Date, string>({
            field: 'requestDate',
            recursive: true,
            handler: (date) => format(new Date(date), 'dd.MM.yyyy'),
        }),
    )
    async addIssuedDocsRequest(
        @Request() {user}: AuthorizedRequest,
        @Body() {type}: {type: string},
    ): Promise<Answer<Partial<IssuedDocument>>> {
        try {
            const data = await this.issuedDocsService.addIssuedDocsRequest(user, type);

            return {success: true, data};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }

    @Post('/response')
    @UseInterceptors(
        FileInterceptor('file', {dest: 'uploads/'}),
        FileExtender,
    )
    async addIssuedDocsResponse(
        @Request() {user}: AuthorizedRequest,
        @Body() {serialCode} : {serialCode: number},
        @UploadedFile() file: Express.Multer.File,
    ): Promise<Answer<Partial<IssuedDocument>>> {
        try {
            const data = await this.issuedDocsService.addIssuedDocsResponse(user, serialCode, file);

            return {success: true, data};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }

    @Get('/user')
    @UseInterceptors(
        new FieldTransformInterceptor<string | Date, string>({
            field: 'requestDate',
            recursive: true,
            handler: (date) => format(new Date(date), 'dd.MM.yyyy'),
        }),
    )
    async getUserIssuedDoc(
        @Query('serialCode') serialCode: number,
    ):
        Promise<Answer<Partial<IssuedDocument>>> {
        try {
            const data = await this.issuedDocsService.getIssuedDoc(serialCode);

            return {success: true, data};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }
}
