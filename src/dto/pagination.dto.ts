import {IsInt, IsOptional, Min} from 'class-validator';
import {Transform} from 'class-transformer';

const defaults = {
    take: 10,
    skip: 0,
};

export class PaginationDto {
    @IsInt()
    @Transform(({value}) => value && parseInt(value, 10))
    @Min(1)
    @IsOptional()
        take: number = defaults.take;

    @IsInt()
    @Transform(({value}) => value && parseInt(value, 10))
    @Min(0)
    @IsOptional()
        skip: number = defaults.skip;
}
