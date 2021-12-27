import {IsOptional, IsString, MinLength} from 'class-validator';

export class ChangeStatusDto {
    @IsString()
    @MinLength(2)
        login: string;

    @IsString()
    @MinLength(5)
    @IsOptional()
        reason?: string;
}
