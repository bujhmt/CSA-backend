import {
    Controller, Get, Logger, Req, UseGuards,
} from '@nestjs/common';
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard';
import {VerificationService} from '../services/verification.service';
import {AuthorizedRequest} from '../../../interfaces/authorized-request.interface';
import {Answer} from '../../../interfaces/answer.interface';
import {Role} from '.prisma/client';

@Controller('/verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
    private readonly logger = new Logger(VerificationController.name);

    constructor(
        private readonly verificationService: VerificationService,
    ) {
    }

    @Get('/role')
    getUserRole(@Req() {user}: AuthorizedRequest): Role {
        return user.role;
    }

    @Get('/')
    async getVerification(@Req() {user}: AuthorizedRequest): Promise<Answer<boolean>> {
        try {
            const data = await this.verificationService.getUserVerification(user);

            return {success: true, data};
        } catch (err) {
            this.logger.error(err);
            return {success: false};
        }
    }
}
