import {
    Controller, Post, UseGuards, Request, Body, UseFilters,
} from '@nestjs/common';
import {RequestValidationFilter} from 'src/filters/request-validation.filter';
import {CreateUserDTO} from './dto/create-user.dto';
import {LocalAuthGuard} from './guards/local-auth.guard';
import {DoesUserExist} from './guards/user-exist.guard';
import {CreateUserToken} from './interfaces/create-user-token.interface';
import {AuthService} from './services/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@Request() req): Promise<string> {
        return this.authService.login(req.user);
    }

    @UseFilters(RequestValidationFilter)
    @UseGuards(DoesUserExist)
    @Post('signup')
    signUp(@Body() user: CreateUserDTO): Promise<CreateUserToken> {
        return this.authService.create(user);
    }
}
