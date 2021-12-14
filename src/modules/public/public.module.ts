import {Module} from '@nestjs/common';
import {UsersService} from './services/users.service';
import {UsersController} from './controllers/users.controller';
import {DatabaseModule} from '../database/database.module';
import {IssuedDocsController} from './controllers/issued-docs.controller';
import {IssuedDocsService} from './services/issued-docs.service';

@Module({
    imports: [DatabaseModule],
    providers: [UsersService, IssuedDocsService],
    controllers: [UsersController, IssuedDocsController],
    exports: [UsersService],
})
export class PublicModule {}
