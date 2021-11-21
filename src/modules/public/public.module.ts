import {Module} from '@nestjs/common';
import {UsersService} from './services/users.service';
import {UsersController} from './controllers/users.controller';
import {DatabaseModule} from '../database/database.module';

@Module({
    imports: [
        DatabaseModule,
    ],
    providers: [
        UsersService,
    ],
    controllers: [
        UsersController,
    ],
})
export class PublicModule {
}
