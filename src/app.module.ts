import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {resolve} from 'path';
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
        PublicModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
