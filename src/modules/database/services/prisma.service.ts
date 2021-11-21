import {
    INestApplication, Injectable, Logger, OnModuleInit,
} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    private readonly logger = new Logger('Prisma');

    async onModuleInit() {
        this.logger.log('Connection to database...');
        await this.$connect();
        this.logger.log('Database connected');
    }

    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close();
        });
    }
}
