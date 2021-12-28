import {
    Controller,
    Get,
    Logger,
    UseGuards,
    Request,
    UseInterceptors,
    Post,
    Body,
    UploadedFiles,
    UnauthorizedException,
    UseFilters, Query, Param,
} from '@nestjs/common';
import {JwtAuthGuard} from 'src/modules/auth/guards/jwt-auth.guard';
import {UsersService} from 'src/modules/shared/services/users.service';
import {FilesInterceptor} from '@nestjs/platform-express';
import {Answer} from 'src/interfaces/answer.interface';
import {Role} from '@prisma/client';
import {AuthorizedRequest} from '../../../interfaces/authorized-request.interface';
import {User} from '.prisma/client';
import {ActionLogsService} from '../../shared/services/action-logs.service';
import {ChangeStatusDto} from '../dto/users/change-status.dto';
import {RequestValidationFilter} from '../../../filters/request-validation.filter';
import {ClearAnswerInterceptor} from '../../../interceptors/clear-answer.interceptor';
import {GetUsersDto} from '../dto/users/get-users.dto';

@Controller('/user')
@UseGuards(JwtAuthGuard)
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(
        private readonly userService: UsersService,
        private readonly actionLogsService: ActionLogsService,
    ) {
    }

    @Get('/')
    @UseFilters(RequestValidationFilter)
    @UseInterceptors(
        new ClearAnswerInterceptor(['passwordHash', 'id']),
    )
    public async list(@Query() getUsersDto: GetUsersDto): Promise<Answer<Partial<User>[]>> {
        try {
            const [data, total] = await this.userService.list(getUsersDto);

            return {success: true, data, total};
        } catch (err) {
            this.logger.error(err);
            return {success: false};
        }
    }

    @Get('/users')
    async getAllUsers(@Request() {user}: AuthorizedRequest, @Query() getUsersDTO: GetUsersDto) {
        const isRegistrator = await this.userService.getUserById(user.id);
        if (isRegistrator.role !== Role.REGISTER || !isRegistrator.isActive) {
            throw new UnauthorizedException();
        }
        console.log(getUsersDTO);
        try {
            const [data, total] = await this.userService.getAllUsers(getUsersDTO);
            return {success: true, data, total};
        } catch (err) {
            this.logger.error(err);
            return {success: false};
        }
    }

    @Post('/addDocs/files')
    @UseInterceptors(
        FilesInterceptor('files', 128, {dest: 'uploads/'}),
    )
    async addDocs(
        @Request() {user}: AuthorizedRequest,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ): Promise<Answer<Partial<User>>> {
        try {
            const data = await this.userService.addFiles(user, files);

            await this.actionLogsService.makeLog({
                userId: user.id,
                newSnapshot: data,
                type: 'Додання документів користувачем',
            });

            return {success: true, data};
        } catch (err) {
            this.logger.error(err);
            return {success: false};
        }
    }

    @Post('/addDocs/info')
    async addInfo(
        @Request() {user}: AuthorizedRequest,
        @Body() addInfoData,
    ): Promise<Answer<Partial<User>>> {
        try {
            const data = await this.userService.addInfo(user, addInfoData);

            await this.actionLogsService.makeLog({
                userId: user.id,
                newSnapshot: data,
                type: 'Оновлення даних користувача',
            });

            return {success: true, data};
        } catch (err) {
            this.logger.error(err);
            return {success: false};
        }
    }

    @Get('/getInfo')
    async getInfo(
        @Request() {user}: AuthorizedRequest,
        @Body() {userId}: { userId: string },
    ): Promise<Answer<Partial<User>>> {
        const isRegister = await this.userService.getUserById(user.id);

        if (isRegister.role !== Role.REGISTER || !isRegister.isActive) {
            throw new UnauthorizedException();
        }

        try {
            const data = await this.userService.getInfo(user, userId);

            await this.actionLogsService.makeLog({
                userId: user.id,
                type: 'Отримання даних користувача',
            });

            return {success: true, data};
        } catch (err) {
            this.logger.error(err);
            return {success: false};
        }
    }

    @Get('/getFiles')
    async getFiles(
        @Request() {user}: AuthorizedRequest,
        @Body() {userId}: { userId: string },
    ): Promise<Answer<string[]>> {
        const isRegister = await this.userService.getUserById(user.id);

        if (isRegister.role !== Role.REGISTER || !isRegister.isActive) {
            throw new UnauthorizedException();
        }

        try {
            const data = await this.userService.getFiles(user, userId);

            await this.actionLogsService.makeLog({
                userId: user.id,
                type: 'Отримання документів користувача',
            });

            return {success: true, data};
        } catch (err) {
            this.logger.error(err);
            return {success: false};
        }
    }

    @Post('/deactivate')
    @UseFilters(RequestValidationFilter)
    async deactivateUser(
        @Request() {user}: AuthorizedRequest,
        @Body() {login, reason}: ChangeStatusDto,
    ): Promise<Answer<Partial<User>>> {
        const isAdmin = await this.userService.getUserById(user.id);

        if (isAdmin.role !== Role.ADMIN || !isAdmin.isActive) {
            throw new UnauthorizedException();
        }

        try {
            const data = await this.userService.deactivateUser(user, login);

            await this.actionLogsService.makeLog({
                userId: user.id,
                type: 'Деактивація користувача',
                newSnapshot: data,
                oldSnapshot: {
                    ...data,
                    isActive: true,
                },
                reason,
            });

            return {success: true, data};
        } catch {
            return {success: false};
        }
    }

    @Post('/activate')
    @UseFilters(RequestValidationFilter)
    async activateUser(
        @Request() {user}: AuthorizedRequest,
        @Body() {login, reason}: ChangeStatusDto,
    ): Promise<Answer<Partial<User>>> {
        const isAdmin = await this.userService.getUserById(user.id);

        if (isAdmin.role !== Role.ADMIN || !isAdmin.isActive) {
            throw new UnauthorizedException();
        }

        try {
            const data = await this.userService.activateUser(user, login);

            await this.actionLogsService.makeLog({
                userId: user.id,
                type: 'Активація користувача',
                newSnapshot: data,
                oldSnapshot: {
                    ...data,
                    isActive: false,
                },
                reason,
            });

            return {success: true, data};
        } catch {
            return {success: false};
        }
    }

    @Get('/:login')
    @UseFilters(RequestValidationFilter)
    @UseInterceptors(
        new ClearAnswerInterceptor(['passwordHash', 'id']),
    )
    public async getByLogin(@Param('login') login: string): Promise<Answer<Partial<User>>> {
        try {
            const data = await this.userService.getUserByLogin(login);

            return {success: true, data};
        } catch (err) {
            this.logger.error(err);
            return {success: false};
        }
    }
}
