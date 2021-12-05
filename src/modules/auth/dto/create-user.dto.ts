import {
    IsDateString, IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength,
} from 'class-validator';
import {Role, User} from '.prisma/client';

export class CreateUserDTO implements Omit<User, 'id'|'passwordHash'> {
    organizationId: string;

    @IsEmail()
        email: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
        login: string;

    @IsEnum(Role)
        role: Role;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
        firstName: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
        lastName: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
        middleName: string;

    @IsDateString()
        birthdate: Date;

    @IsNotEmpty()
    @IsString()
        birthplace: string;

    @IsNotEmpty()
    @IsString()
        residence: string;

    @IsString()
        workPosition: string;

    @IsString()
    @MinLength(8)
    @MaxLength(100)
        password: string;
}
