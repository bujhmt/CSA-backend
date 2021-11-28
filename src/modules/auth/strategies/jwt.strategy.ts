import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {UsersService} from 'src/modules/public/services/users.service';
import {UserPayload} from '../interfaces/user-validation-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWTKEY,
        });
    }

    async validate(payload: UserPayload): Promise<UserPayload> {
        const user = await this.userService.getUserById(payload.id);
        if (!user) {
            throw new UnauthorizedException('User is not authorized');
        }

        return payload;
    }
}
