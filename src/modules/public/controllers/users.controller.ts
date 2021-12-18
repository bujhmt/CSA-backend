import {Controller, Get, Logger} from '@nestjs/common';
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

    //     @Post('/info')
    //     @UseInterceptors(FileFieldsInterceptor([
    //         {name: 'family', maxCount: 64},
    //         {name: 'land', maxCount: 64},
    //         {name: 'deadDebt', maxCount: 64},
    //         {name: 'childrenPoA', maxCount: 64},
    //         {name: 'insurancy', maxCount: 64},
    //         {name: 'inheritance', maxCount: 64},
    //     ]))
    //     postInfo(
    // @UploadedFiles() files: { avatar?: Express.Multer.File[], background?: Express.Multer.File[] },
    //              @Body() {
    //         firstName, middleName, passportNumber, passportSeries, secondName, taxpayerIdentificationNumber,
    //     }: AddInfoDRO,
    //     ) {

    //     }

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
