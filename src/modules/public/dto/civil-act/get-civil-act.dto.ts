import {IsString, IsUUID} from 'class-validator';

export class GetCivilActDTO {
    @IsString()
        actId: string;
}
