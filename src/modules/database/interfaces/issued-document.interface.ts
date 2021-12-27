import {IssuedDocument as IssuedDocumentModel} from '.prisma/client';
import {User} from './user.interface';

export interface IssuedDocument extends IssuedDocumentModel {
    requester: Partial<User>;
}
