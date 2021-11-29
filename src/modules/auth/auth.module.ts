import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {Environment} from 'src/interfaces/environment.interface';
import {PublicModule} from '../public/public.module';
import {AuthController} from './auth.controller';
import {AuthService} from './services/auth.service';
import {JwtStrategy} from './strategies/jwt.strategy';
import {LocalStrategy} from './strategies/local.strategy';

@Module({
    imports: [
        PassportModule,
        PublicModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService<Environment>) => ({
                secret: configService.get('JWTKEY'),
                signOptions: {expiresIn: configService.get('TOKEN_EXPIRATION')},
            }),
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    controllers: [AuthController],
})
export class AuthModule {}
