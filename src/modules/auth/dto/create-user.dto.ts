import {
    IsDate, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength,
} from 'class-validator';
import {Role, User} from '.prisma/client';

export class CreateUserDTO implements Omit<User, 'id'> {
    organizationId: string;

    @IsEmail()
        email: string;

    @IsNotEmpty()
    @IsString()
        passwordHash: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
        login: string;

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

    @IsDate()
        birthdate: Date;

    @IsNotEmpty()
    @IsString()
        birthplace: string;

    @IsNotEmpty()
    @IsString()
        residence: string;

    @IsNotEmpty()
    @IsString()
        workPosition: string;

    @IsString()
    @MinLength(8)
    @MaxLength(100)
        password: string;
}
