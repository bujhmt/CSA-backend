import {
    Body,
    Controller, Get, Logger, UseGuards, Request, Post, Query,
} from '@nestjs/common';
import {Answer} from 'src/interfaces/answer.interface';
import {AuthorizedRequest} from 'src/interfaces/authorized-request.interface';
import {CivilStatusAct} from '.prisma/client';
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard';
import {ActionLogsService} from '../../shared/services/action-logs.service';
import {CivilActService} from '../services/civil-act.service';
import {UpdateCivilActDTO} from '../dto/civil-act/update-civil-act.dto';
import {GetUserCivilActDTO} from '../dto/civil-act/get-user-civil-act.dto';
import {GetCivilActDTO} from '../dto/civil-act/get-civil-act.dto';
import {CreateCivilActDTO} from '../dto/civil-act/create-civil-act.dto';

@Controller('/civil-act')
@UseGuards(JwtAuthGuard)
export class CivilActController {
    private readonly logger = new Logger(CivilActController.name);

    constructor(
        private readonly actionLogsService: ActionLogsService,
        private readonly civilActService: CivilActService,
    ) {}

    @Get('/user')
    async getUserCivilActs(
        @Request() {user}: AuthorizedRequest,
        @Query() {userId}: GetUserCivilActDTO,
    ): Promise<Answer<Partial<CivilStatusAct[]>>> {
        try {
            const [data, total] = await this.civilActService.getUserCivilActs(user, userId);

            await this.actionLogsService.makeLog({
                type: 'Отримання всіх актів цивільного стану користувача',
                userId: user.id,
                newSnapshot: data,
            });

            return {success: true, data, total};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }

    @Get('/act')
    async getCivilAct(
        @Request() {user}: AuthorizedRequest,
        @Query() {actId}: GetCivilActDTO,
    ): Promise<Answer<Partial<CivilStatusAct>>> {
        try {
            const data = await this.civilActService.getCivilAct(user, actId);

            await this.actionLogsService.makeLog({
                type: 'Отримання акту цивільного стану',
                userId: user.id,
                newSnapshot: data,
            });

            return {success: true, data};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }

    @Post('/create')
    async createUserCivilAct(
        @Request() {user}: AuthorizedRequest,
        @Body() createActDTO: CreateCivilActDTO,
    ): Promise<Answer<CivilStatusAct>> {
        try {
            return {success: true, data: await this.civilActService.createUserCivilAct(user, createActDTO)};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }

    @Post('/update')
    async updateUserCivilAct(
        @Request() {user}: AuthorizedRequest,
        @Body() {
                userId, civilActId, newData, isActive,
            }: UpdateCivilActDTO,
    ): Promise<Answer<Partial<CivilStatusAct>>> {
        try {
            const {oldSnapshot, newSnapshot} = await this.civilActService.updateUserCivilAct(
                user,
                userId,
                civilActId,
                newData,
                isActive,
            );
            const type = isActive
                ? 'Зміна акту цивільного стану регістратором'
                : 'Деактивація акту цивільного стану регістратором';
            await this.actionLogsService.makeLog({
                type,
                userId: user.id,
                oldSnapshot,
                newSnapshot,
            });

            return {success: true, data: newSnapshot};
        } catch (err) {
            this.logger.error(err.message);
            return {success: false};
        }
    }
}
