import {IsString} from 'class-validator';

export class AddDocRequestDTO {
    @IsString()
        type: string;
}
