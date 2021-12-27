import {IsNumber} from 'class-validator';

export class AddDocResponseDTO {
    @IsNumber({maxDecimalPlaces: 8})
        serialCode: number;
}
