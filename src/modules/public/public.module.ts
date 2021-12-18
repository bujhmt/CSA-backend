import {Module} from '@nestjs/common';
import {DatabaseModule} from '../database/database.module';
import {IssuedDocsController} from './controllers/issued-docs.controller';
import {IssuedDocsService} from './services/issued-docs.service';
import {VerificationService} from './services/verification.service';

@Module({
    imports: [
        DatabaseModule,
    ],
    providers: [
        IssuedDocsService,
        VerificationService,
    ],
    controllers: [
        IssuedDocsController,
    ],
})
export class PublicModule {}
