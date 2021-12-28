import {IsBoolean, IsOptional, IsString, IsUUID} from 'class-validator';

export class UpdateCivilActDTO {
    @IsString()
        userId: string;

    @IsString()
        civilActId: string;

    @IsOptional()
        newData?: Record<string, string>;

    @IsBoolean()
        isActive : boolean;
}
