import {
    Controller, Get, Logger, UseGuards, Request, UseInterceptors, Post, Body, UploadedFiles, Res,
} from '@nestjs/common';
import {JwtAuthGuard} from 'src/modules/auth/guards/jwt-auth.guard';
import {format} from 'date-fns';
import {UsersService} from 'src/modules/shared/services/users.service';
import {FilesInterceptor} from '@nestjs/platform-express';
import * as archiver from 'archiver';
import {
    access, accessSync, constants, createReadStream, exists,
} from 'fs';
import {join} from 'path';
import {AuthorizedRequest} from '../../../interfaces/authorized-request.interface';
import {FieldTransformInterceptor} from '../../../interceptors/field-transform.interceptor';
import {AddInfoDTO} from '../dto/add-info.dto';
import {User} from '.prisma/client';

@Controller('/user')
@UseGuards(JwtAuthGuard)
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(
        private readonly userService: UsersService,
    ) {
    }

    @Post('/addDocs')
    @UseInterceptors(
        new FieldTransformInterceptor<string | Date, string>({
            field: 'requestDate',
            recursive: true,
            handler: (date) => format(new Date(date), 'dd.MM.yyyy'),
        }),
        FilesInterceptor('files', 128, {dest: 'uploads/'}),
    )
    async addDocs(
        @Request() {user}: AuthorizedRequest,
        @Body() addInfoData: AddInfoDTO,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ):
    Promise<Partial<User>> {
        return this.userService.addInfo(user, addInfoData, files);
    }

    @Get('/getInfo')
    async getInfo(
        @Request() {user}: AuthorizedRequest,
        @Body() {userId}: {userId: string},
    ):
    Promise<Partial<User>> {
        return this.userService.getInfo(user, userId);
    }

    @Get('/getFiles')
    getFiles(
        @Request() {user}: AuthorizedRequest,
        @Body() {userId}: {userId: string},
        @Res() res,
    ): Promise<string[]> {
        return this.userService.getFiles(user, userId);
    }
}
