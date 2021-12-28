import {IsOptional, IsString} from 'class-validator';

export class CreateCivilActDTO {
    @IsString()
        userId: string;

    @IsOptional()
        data?: Record<string, string>;

    @IsString()
        actType: string;
}
