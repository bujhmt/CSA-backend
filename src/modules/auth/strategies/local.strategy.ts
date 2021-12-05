import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {User} from '@prisma/client';
import {Strategy} from 'passport-local';
import {AuthService} from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({usernameField: 'login'});
    }

    async validate(login: string, password: string): Promise<Omit<Partial<User>, 'passwordHash'>> {
        const user = await this.authService.getUserIfValidCredentials(login, password);
        if (!user) {
            throw new UnauthorizedException('Invalid user credentials');
        }
        return user;
    }
}
