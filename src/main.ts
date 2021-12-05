import {NestFactory} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {Logger, ValidationPipe} from '@nestjs/common';
import {AppModule} from './app.module';
import {Environment} from './interfaces/environment.interface';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get<ConfigService<Environment>>(ConfigService);
    const port = configService.get('PORT');

    app.enableCors({origin: ['http://localhost:8080']});

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );

    Logger.log(`Application successfully started on ${port} port`, 'Bootstrap');
    await app.listen(port);
}

bootstrap();
