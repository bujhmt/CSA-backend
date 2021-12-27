import {
    Controller, Get, Logger, Query, UseFilters, UseGuards, UseInterceptors,
} from '@nestjs/common';
import {format} from 'date-fns';
import {JwtAuthGuard} from '../../auth/guards/jwt-auth.guard';
import {ActionLogsService} from '../../shared/services/action-logs.service';
import {Answer} from '../../../interfaces/answer.interface';
import {ActionLog} from '../../database/interfaces/action-log.interface';
import {GetActionLogsDto} from '../dto/action-logs/get-action-logs.dto';
import {FieldTransformInterceptor} from '../../../interceptors/field-transform.interceptor';
import {RequestValidationFilter} from '../../../filters/request-validation.filter';

@Controller('/logs')
@UseGuards(JwtAuthGuard)
export class ActionLogsController {
    private readonly logger = new Logger(ActionLogsController.name);

    constructor(
        private readonly actionLogsService: ActionLogsService,
    ) {
    }

    @Get('/')
    @UseFilters(RequestValidationFilter)
    @UseInterceptors(
        new FieldTransformInterceptor<string | Date, string>({
            field: 'date',
            recursive: true,
            handler: (date) => format(new Date(date), 'dd.MM.yyyy'),
        }),
    )
    public async list(@Query() getActionLogsDto: GetActionLogsDto): Promise<Answer<Partial<ActionLog>[]>> {
        try {
            const [data, total] = await this.actionLogsService.list(getActionLogsDto);

            return {success: true, data, total};
        } catch (err) {
            this.logger.error(err);
            return {success: false};
        }
    }

    @Get('/:id')
    @UseInterceptors(
        new FieldTransformInterceptor<string | Date, string>({
            field: 'date',
            handler: (date) => format(new Date(date), 'dd.MM.yyyy'),
        }),
    )
    public async getUnique(@Query('id') id: string): Promise<Answer<Partial<ActionLog>>> {
        try {
            const data = await this.actionLogsService.getById(id);

            return {success: true, data};
        } catch (err) {
            this.logger.error(err);
            return {success: false};
        }
    }
}
