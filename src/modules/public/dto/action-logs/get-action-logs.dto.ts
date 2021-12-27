import {IsEnum, IsOptional, IsString} from 'class-validator';
import {PaginationDto} from '../../../../dto/pagination.dto';
import {Role} from '.prisma/client';

const defaults = {role: Role.USER};

export class GetActionLogsDto extends PaginationDto {
    @IsString()
    @IsOptional()
        name?: string;

    @IsEnum(Role)
    @IsOptional()
        role?: Role = defaults.role;

    @IsString()
    @IsOptional()
        type?: string;
}
