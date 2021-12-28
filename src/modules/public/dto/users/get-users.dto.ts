import {IsOptional, IsString} from 'class-validator';
import {PaginationDto} from 'src/dto/pagination.dto';

export class GetUsersDTO extends PaginationDto {
    @IsString()
    @IsOptional()
        name: string;
}
