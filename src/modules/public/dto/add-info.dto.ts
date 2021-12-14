import {
    IsNumber, IsOptional, IsString, MaxLength, MinLength,
} from 'class-validator';

export class AddInfoDRO {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
        firstName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
        secondName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
        middleName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
        passportSeries?: string;

    @IsOptional()
    @IsNumber()
        passportNumber?: number;

    @IsOptional()
    @IsNumber({maxDecimalPlaces: 12})
        taxpayerIdentificationNumber?: number;
}
