import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {join, resolve} from 'path';
import {ServeStaticModule} from '@nestjs/serve-static';
import {envExtractor} from './utils/env-extractor.util';
import {PublicModule} from './modules/public/public.module';
import {AuthModule} from './modules/auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            expandVariables: true,
            envFilePath: resolve(__dirname, '../config', envExtractor()),
        }),
        ServeStaticModule.forRoot({rootPath: join(__dirname, '..', 'uploads')}),
        PublicModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
