import {NestFactory} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {Logger} from '@nestjs/common';
import {AppModule} from './app.module';
import {Environment} from './interfaces/environment.interface';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get<ConfigService<Environment>>(ConfigService);
    const port = configService.get('PORT');

    Logger.log(`Application successfully started on ${port} port`, 'Bootstrap');
    await app.listen(port);
}

bootstrap();
