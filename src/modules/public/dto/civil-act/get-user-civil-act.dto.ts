import {IsString, IsUUID} from 'class-validator';

export class GetUserCivilActDTO {
    @IsString()
        login: string;
}
