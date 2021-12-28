import {
    BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable,
} from '@nestjs/common';
import {validate} from 'class-validator';
import {Observable} from 'rxjs';
import {UsersService} from 'src/modules/shared/services/users.service';
import {CreateUserDTO} from '../dto/users/create-user.dto';

@Injectable()
export class DoesUserExist implements CanActivate {
    constructor(private readonly userService: UsersService) {}

    async validateRequest(req): Promise<boolean> {
        const createUser = new CreateUserDTO();
        createUser.login = req.body.login;
        createUser.password = req.body.password;
        createUser.name = req.body.name;
        const errors = await validate(createUser);

        if (errors.length) {
            throw new BadRequestException(errors);
        }

        const userExist = await this.userService.getUserByLogin(req.body.login);
        if (userExist) {
            throw new ForbiddenException('Login already in use');
        }

        return true;
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        return this.validateRequest(req);
    }
}
