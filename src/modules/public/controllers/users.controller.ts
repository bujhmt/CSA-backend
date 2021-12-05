import {
    Controller, Get, Logger,
} from '@nestjs/common';
import {Answer} from '../../../interfaces/answer.interface';
import {User} from '../../database/interfaces/user.interface';
import {UsersService} from '../services/users.service';

@Controller('/users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(
        private readonly usersService: UsersService,
    ) {
    }

    @Get('/')
    async getUsers(): Promise<Answer<Partial<User>[]>> {
        try {
            const data = await this.usersService.getUsers();

            return {success: true, data};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false, message: err.message};
        }
    }
}
