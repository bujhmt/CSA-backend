import {IsUUID} from 'class-validator';

export class GetUserCivilActDTO {
    @IsUUID()
        userId: string;
}
