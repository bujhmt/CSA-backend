import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {UsersService} from 'src/modules/public/services/users.service';
import {User} from '../../database/interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWTKEY,
        });
    }

    async validate(payload: Pick<User, 'login'>): Promise<Partial<User>> {
        const user = await this.userService.getUserByLogin(payload.login);
        if (!user) {
            throw new UnauthorizedException('User is not authorized');
        }

        return user;
    }
}
