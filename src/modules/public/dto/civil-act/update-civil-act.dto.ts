import {IsBoolean, IsOptional, IsUUID} from 'class-validator';

export class UpdateCivilActDTO {
    @IsUUID()
        userId: string;

    @IsUUID()
        civilActId: string;

    @IsOptional()
        newData?: Record<string, string>;

    @IsBoolean()
        isActive : boolean;
}
