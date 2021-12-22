import {
    IsNumberString, IsString, Length, MaxLength, MinLength,
} from 'class-validator';

export class AddInfoDTO {
    @IsString()
    @MinLength(5)
    @MaxLength(100)
        name: string;

    @IsString()
    @Length(14)
        record: string;

    @IsNumberString()
        document: string;

    @IsNumberString()
    @Length(10)
        taxpayerIdentificationNumber: string;
}
