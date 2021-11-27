import {
    Controller, Post, UseGuards, Request, Body,
} from '@nestjs/common';
import {CreateUserDTO} from './dto/createUser.dto';
import {LocalAuthGuard} from './guards/localAuth.guard';
import {DoesUserExist} from './guards/userExist.guard';
import {AuthService} from './services/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(DoesUserExist)
    @Post('signup')
    async signUp(@Body() user: CreateUserDTO) {
        return this.authService.create(user);
    }
}
