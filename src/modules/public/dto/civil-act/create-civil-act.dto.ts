import {IsOptional, IsString} from 'class-validator';

export class CreateCivilActDTO {
    @IsString()
        login: string;

    @IsOptional()
        data?: Record<string, string>;

    @IsString()
        actType: string;
}
