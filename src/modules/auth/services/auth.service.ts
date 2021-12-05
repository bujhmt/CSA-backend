import * as argon2 from 'argon2';
import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {UsersService} from 'src/modules/public/services/users.service';
import {User} from '.prisma/client';
import {CreateUserDTO} from '../dto/create-user.dto';
import {CreateUserToken} from '../interfaces/create-user-token.interface';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService, private readonly jwtService: JwtService) {}

    private comparePassword(pass: string, hash: string): Promise<boolean> {
        return argon2.verify(hash, pass);
    }

    private hashPassword(password: string): Promise<string> {
        return argon2.hash(password);
    }

    private generateToken(user: Partial<User>): Promise<string> {
        return this.jwtService.signAsync(user);
    }

    async getUserIfValidCredentials(email: string, pass: string): Promise<Omit<Partial<User>, 'passwordHash'> | null> {
        const user = await this.userService.getUserByEmail(email);
        if (!user) {
            return null;
        }
        const match = await this.comparePassword(pass, user.passwordHash);
        if (!match) {
            return null;
        }
        const {passwordHash, ...userData} = user;
        return userData;
    }

    public login(user: User): Promise<string> {
        return this.generateToken(user);
    }

    public async create(userDTO: CreateUserDTO): Promise<CreateUserToken> {
        const {password, ...userData} = userDTO;
        const pass = await this.hashPassword(password);
        const newUser = await this.userService.create({...userData, passwordHash: pass});
        const {passwordHash, ...user} = newUser;
        const token = await this.generateToken(user);
        return {user, token};
    }
}
