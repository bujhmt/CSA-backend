import {
    Controller, Get, Logger, UseGuards, Request, UseInterceptors, Post, Body, UploadedFiles, Put,
} from '@nestjs/common';
import {JwtAuthGuard} from 'src/modules/auth/guards/jwt-auth.guard';
import {format} from 'date-fns';
import {UsersService} from 'src/modules/shared/services/users.service';
import {FilesInterceptor} from '@nestjs/platform-express';
import {AuthorizedRequest} from '../../../interfaces/authorized-request.interface';
import {FieldTransformInterceptor} from '../../../interceptors/field-transform.interceptor';
import {AddInfoDTO} from '../dto/add-info.dto';
import {User} from '.prisma/client';
import { Answer } from 'src/interfaces/answer.interface';

@Controller('/user')
@UseGuards(JwtAuthGuard)
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(
        private readonly userService: UsersService,
    ) {
    }

    @Post('/addDocs/files')
    @UseInterceptors(
        FilesInterceptor('files', 128, {dest: 'uploads/'}),
    )
    async addDocs(
        @Request() {user}: AuthorizedRequest,
        @Body() addInfoData,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ):
    Promise<Partial<User>> {
        return this.userService.addFiles(user, files);
    }

    @Post('/addDocs/info')
    async addInfo(
        @Request() {user}: AuthorizedRequest,
        @Body() addInfoData,
    ):
    Promise<Partial<User>> {
        return this.userService.addInfo(user, addInfoData);
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
    ): Promise<string[]> {
        return this.userService.getFiles(user, userId);
    }

    @Put('/deactivate')
    async deactivateUser(
        @Request() {user}: AuthorizedRequest,
        @Body() {login}: {login: string},
    ): Promise<Answer<Partial<User>>> {
        try {
            return {success: true, data: await this.userService.deactivateUser(user, login)};
        } catch {
            return {success: false};
        }
    }
}
