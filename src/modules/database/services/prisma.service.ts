import {
    Injectable, Logger, OnModuleDestroy, OnModuleInit,
} from '@nestjs/common';
import {Prisma, PrismaClient} from '.prisma/client';

@Injectable()
export class PrismaService extends PrismaClient<Prisma.PrismaClientOptions, 'query'> implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger('Prisma');

    constructor() {
        super({log: ['query']});
    }

    async onModuleInit(): Promise<void> {
        try {
            this.logger.log('Connecting to database...');
            await this.$connect();
            this.logger.log('Database connected');

            this.$on('query', (e: Prisma.QueryEvent) => {
                this.logger.log(`QUERY: ${e.query}, PARAMS: ${e.params} DURATION: ${e.duration}`);
            });
        } catch (err) {
            this.logger.error('Could not connect to database');
            this.logger.error(err);
        }
    }

    async onModuleDestroy(): Promise<void> {
        try {
            this.logger.log('Disconnecting from database...');
            await this.$disconnect();
            this.logger.log('Database disconnected');
        } catch (err) {
            this.logger.error('Could not disconnect from database');
            this.logger.error(err);
        }
    }
}
