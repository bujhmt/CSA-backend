import {Module} from '@nestjs/common';
import {DatabaseModule} from '../database/database.module';
import {UsersService} from './services/users.service';
import {ActionLogsService} from './services/action-logs.service';

@Module({
    imports: [DatabaseModule],
    providers: [UsersService, ActionLogsService],
    exports: [UsersService, ActionLogsService],
})
export class SharedModule {

}
