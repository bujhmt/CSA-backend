import {IsEnum, IsOptional, IsString} from 'class-validator';
import {PaginationDto} from '../../../../dto/pagination.dto';
import {Role} from '.prisma/client';

export class GetUsersDto extends PaginationDto {
    @IsString()
    @IsOptional()
        name?: string;

    @IsEnum(Role)
    @IsOptional()
        role?: Role;
}
