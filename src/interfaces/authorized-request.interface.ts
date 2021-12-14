import {Request} from 'express';
import {User} from '../modules/database/interfaces/user.interface';

export interface AuthorizedRequest extends Request {
    user: Partial<User>;
}
