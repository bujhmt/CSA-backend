import {
    IsNumber, IsNumberString, IsOptional, IsString, Length, MaxLength, MinLength,
} from 'class-validator';

export class AddInfoDTO {
    @IsString()
    @MinLength(2)
    @MaxLength(50)
        firstName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
        lastName: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
        middleName: string;

    @IsString()
    @Length(14)
        record: string;

    @IsNumberString()
        issuingAuthority: string;

    @IsNumberString()
        passportNumber: string;

    @IsNumberString({maxDecimalPlaces: 10})
        taxpayerIdentificationNumber: string;
}
