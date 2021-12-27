import {
    Controller, Get, Logger, UseGuards, Request, UseInterceptors, Post, Body, Query, UploadedFile,
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
import {IssuedDocStatus} from '.prisma/client';
import {ActionLogsService} from '../../shared/services/action-logs.service';

@Controller('/issued-docs')
@UseGuards(JwtAuthGuard)
export class IssuedDocsController {
    private readonly logger = new Logger(IssuedDocsController.name);

    constructor(
        private readonly issuedDocsService: IssuedDocsService,
        private readonly actionLogsService: ActionLogsService,
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

            await this.actionLogsService.makeLog({
                type: 'Отримання запитів користувачем',
                userId: user.id,
            });

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

            await this.actionLogsService.makeLog({
                type: 'Створення запиту користувачем',
                userId: user.id,
                newSnapshot: data,
            });

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

            await this.actionLogsService.makeLog({
                type: '???',
                userId: user.id,
                newSnapshot: data,
            });

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
        @Request() {user}: AuthorizedRequest,
    ): Promise<Answer<Partial<IssuedDocument>>> {
        try {
            const data = await this.issuedDocsService.getUserIssuedDoc(user, serialCode);

            await this.actionLogsService.makeLog({
                type: 'Отримання документів користувача реєстратором',
                userId: user.id,
            });

            return {success: true, data};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }

    @Post('/updateStatus')
    @UseInterceptors(
        new FieldTransformInterceptor<string | Date, string>({
            field: 'requestDate',
            recursive: true,
            handler: (date) => format(new Date(date), 'dd.MM.yyyy'),
        }),
    )
    async updateStatusDoc(
        @Query('serialCode') serialCode: number,
        @Body() {status}: {status: IssuedDocStatus},
        @Request() {user}: AuthorizedRequest,
    ):
        Promise<Answer<Partial<IssuedDocument>>> {
        try {
            const oldData = await this.issuedDocsService.getBySerialCode(serialCode);
            const data = await this.issuedDocsService.setDocStatus(user, serialCode, status);

            await this.actionLogsService.makeLog({
                type: 'Зміна статусу документа реєстратором',
                userId: user.id,
                newSnapshot: data,
                oldSnapshot: oldData,
            });

            return {success: true, data};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }
}
