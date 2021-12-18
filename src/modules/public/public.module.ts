import {Module} from '@nestjs/common';
import {UsersController} from './controllers/users.controller';
import {DatabaseModule} from '../database/database.module';
import {IssuedDocsController} from './controllers/issued-docs.controller';
import {IssuedDocsService} from './services/issued-docs.service';
import {VerificationService} from './services/verification.service';
import {SharedModule} from '../shared/shared.module';

@Module({
    imports: [
        DatabaseModule,
        SharedModule,
    ],
    providers: [
        IssuedDocsService,
        VerificationService,
    ],
    controllers: [
        UsersController,
        IssuedDocsController,
    ],
})
export class PublicModule {}
