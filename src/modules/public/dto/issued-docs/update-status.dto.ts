import {IssuedDocStatus} from '@prisma/client';
import {IsEnum, IsOptional} from 'class-validator';

export class UpdateStatusDTO {
    @IsEnum(IssuedDocStatus)
        status: IssuedDocStatus;

    @IsOptional()
        comment?: string;
}
