import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {resolve} from 'path';
import {envExtractor} from './utils/env-extractor.util';
import {DatabaseModule} from './modules/database/database.module';
import {PublicModule} from './modules/public/public.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            expandVariables: true,
            envFilePath: resolve(__dirname, '../config', envExtractor()),
        }),
        DatabaseModule,
        PublicModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
