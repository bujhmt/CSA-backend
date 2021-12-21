import {Module} from '@nestjs/common';
import {MulterModule} from '@nestjs/platform-express';
import {diskStorage} from 'multer';
import {extname} from 'path';
import {v4 as uuidv4} from 'uuid';
import {DatabaseModule} from '../database/database.module';
import {UsersService} from '../shared/services/users.service';
import {IssuedDocsController} from './controllers/issued-docs.controller';
import {UserController} from './controllers/user.controller';
import {VerificationController} from './controllers/verification.controller';
import {IssuedDocsService} from './services/issued-docs.service';
import {VerificationService} from './services/verification.service';

@Module({
    imports: [
        DatabaseModule,
        MulterModule.register({
            dest: 'uploads/',
            storage: diskStorage({
                destination: 'uploads/',
                filename: (req, file, cb) => {
                    cb(null, `${uuidv4()}${extname(file.originalname)}`);
                },
            }),
        }),
    ],
    providers: [
        IssuedDocsService,
        VerificationService,
        UsersService,
    ],
    controllers: [
        IssuedDocsController,
        VerificationController,
        UserController,
    ],
})
export class PublicModule {}
