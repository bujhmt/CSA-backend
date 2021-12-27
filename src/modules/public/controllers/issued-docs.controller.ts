import {
    Body, Controller, Get, Logger, Post, Query, Request, Res, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {format} from 'date-fns';
import {JwtAuthGuard} from 'src/modules/auth/guards/jwt-auth.guard';
import {FieldTransformInterceptor} from '../../../interceptors/field-transform.interceptor';
import {Answer} from '../../../interfaces/answer.interface';
import {AuthorizedRequest} from '../../../interfaces/authorized-request.interface';
import {IssuedDocument} from '../../database/interfaces/issued-document.interface';
import {ActionLogsService} from '../../shared/services/action-logs.service';
import {AddDocRequestDTO} from '../dto/issued-docs/add-doc-request.dto';
import {AddDocResponseDTO} from '../dto/issued-docs/add-doc-response.dto';
import {UpdateStatusDTO} from '../dto/issued-docs/update-status.dto';
import {FileExtender} from '../interceptors/file-extender.interceptor';
import {IssuedDocsService} from '../services/issued-docs.service';

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
        @Body() {type}: AddDocRequestDTO,
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
        @Body() {serialCode} : AddDocResponseDTO,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<Answer<Partial<IssuedDocument>>> {
        try {
            const data = await this.issuedDocsService.addIssuedDocsResponse(user, serialCode, file);

            await this.actionLogsService.makeLog({
                type: 'Додавання реєстратором документа у відповідь на запит',
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
        @Body() {status, comment}: UpdateStatusDTO,
        @Request() {user}: AuthorizedRequest,
    ):
        Promise<Answer<Partial<IssuedDocument>>> {
        try {
            const oldData = await this.issuedDocsService.getBySerialCode(serialCode);
            const data = await this.issuedDocsService.setDocStatus(user, serialCode, status, comment);

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

    @Get('/receipt')
    async generateReceipt(@Res() res) {
        this.issuedDocsService.generateReceipt().pipe(res);
    }
}
