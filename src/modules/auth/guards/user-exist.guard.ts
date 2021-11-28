import {
    CanActivate, ExecutionContext, ForbiddenException, Injectable,
} from '@nestjs/common';
import {Observable} from 'rxjs';
import {UsersService} from 'src/modules/public/services/users.service';

@Injectable()
export class DoesUserExist implements CanActivate {
    constructor(private readonly userService: UsersService) {}

    async validateRequest(req): Promise<boolean> {
        const userExist = await this.userService.getUserByEmail(req.body.email);
        if (userExist) {
            throw new ForbiddenException('Email already in use');
        }
        return true;
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest();
        return this.validateRequest(req);
    }
}
