import {
    Controller, Post, UseGuards, Body, UseFilters, Request,
} from '@nestjs/common';
import {RequestValidationFilter} from 'src/filters/request-validation.filter';
import {Request as RequestType} from 'express';
import {CreateUserDTO} from './dto/create-user.dto';
import {LocalAuthGuard} from './guards/local-auth.guard';
import {DoesUserExist} from './guards/user-exist.guard';
import {CreateUserToken} from './interfaces/create-user-token.interface';
import {AuthService} from './services/auth.service';
import {User} from '../database/interfaces/user.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req: RequestType & {user: User}): Promise<{token: string}> {
        return {token: await this.authService.login(req.user)};
    }

    @UseFilters(RequestValidationFilter)
    @UseGuards(DoesUserExist)
    @Post('signup')
    signUp(@Body() createUserDTO: CreateUserDTO): Promise<CreateUserToken> {
        return this.authService.create(createUserDTO);
    }
}
