import {IsBoolean, IsOptional, IsString, IsUUID} from 'class-validator';

export class SetActiveCivilActDTO {
    @IsString()
        civilActId: string;
}
