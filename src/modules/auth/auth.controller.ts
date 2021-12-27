import {
    Controller, Post, UseGuards, Body, UseFilters, Request,
} from '@nestjs/common';
import {RequestValidationFilter} from 'src/filters/request-validation.filter';
import {AuthorizedRequest} from 'src/interfaces/authorized-request.interface';
import {CreateUserDTO} from './dto/users/create-user.dto';
import {LocalAuthGuard} from './guards/local-auth.guard';
import {DoesUserExist} from './guards/user-exist.guard';
import {CreateUserToken} from './interfaces/create-user-token.interface';
import {AuthService} from './services/auth.service';
import {JwtAuthGuard} from './guards/jwt-auth.guard';
import {ActionLogsService} from '../shared/services/action-logs.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly actionLogsService: ActionLogsService,
    ) {
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() {user}: AuthorizedRequest): Promise<{ token: string }> {
        const token = await this.authService.login(user);

        await this.actionLogsService.makeLog({
            userId: user.id,
            type: 'Логін',
        });

        return {token};
    }

    @UseFilters(RequestValidationFilter)
    @UseGuards(DoesUserExist)
    @Post('signup')
    async signUp(@Body() createUserDTO: CreateUserDTO): Promise<CreateUserToken> {
        const data = await this.authService.create(createUserDTO);

        await this.actionLogsService.makeLog({
            userId: data.user.id,
            type: 'Реєстрація користувача',
            newSnapshot: data.user,
        });

        return data;
    }

    @UseFilters(RequestValidationFilter)
    @UseGuards(JwtAuthGuard, DoesUserExist)
    @Post('signup/registrator')
    async signUpReg(
        @Request() {user}: AuthorizedRequest,
        @Body() createUserDTO: CreateUserDTO,
    ): Promise<CreateUserToken> {
        const data = await this.authService.create(createUserDTO, user);

        await this.actionLogsService.makeLog({
            userId: data.user.id,
            type: 'Реєстрація реєстратора',
            newSnapshot: data.user,
        });

        return data;
    }
}
