import {IsString, MaxLength, MinLength} from 'class-validator';

export class CreateUserDTO {
    @IsString()
    @MinLength(5)
    @MaxLength(50)
        login: string;

    @IsString()
    @MinLength(8)
    @MaxLength(100)
        password: string;

    @IsString()
    @MinLength(7)
    @MaxLength(100)
        name: string;
}
