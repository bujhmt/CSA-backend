import * as argon2 from 'argon2';
import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {UsersService} from 'src/modules/public/services/users.service';
import {User} from '.prisma/client';
import {CreateUserDTO} from '../dto/createUser.dto';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService, private readonly jwtService: JwtService) {}

    private async comparePassword(pass: string, hash: string) {
        return argon2.verify(hash, pass);
    }

    private async hashPassword(password: string) {
        const hash = await argon2.hash(password);
        return hash;
    }

    private async generateToken(user: Partial<User>) {
        return this.jwtService.signAsync(user);
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.getUserByEmail(email);
        if (!user) {
            return null;
        }
        const match = await this.comparePassword(pass, user.passwordHash);
        if (!match) {
            return null;
        }
        const {passwordHash, ...res} = user;
        return res;
    }

    public async login(user: User) {
        const token = await this.generateToken(user);
        return {user, token};
    }

    public async create(user: CreateUserDTO) {
        const pass = await this.hashPassword(user.password);
        const newUser = await this.userService.create({...user, passwordHash: pass});
        const {passwordHash, ...result} = newUser;
        const token = await this.generateToken(result);
        return {user: result, token};
    }
}
