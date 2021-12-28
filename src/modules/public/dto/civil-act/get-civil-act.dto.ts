import {IsUUID} from 'class-validator';

export class GetCivilActDTO {
    @IsUUID()
        actId: string;
}
