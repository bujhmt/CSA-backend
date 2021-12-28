import {Module} from '@nestjs/common';
import {MulterModule} from '@nestjs/platform-express';
import {diskStorage} from 'multer';
import {extname} from 'path';
import {v4 as uuidv4} from 'uuid';
import {DatabaseModule} from '../database/database.module';
import {IssuedDocsController} from './controllers/issued-docs.controller';
import {UserController} from './controllers/user.controller';
import {VerificationController} from './controllers/verification.controller';
import {IssuedDocsService} from './services/issued-docs.service';
import {VerificationService} from './services/verification.service';
import {SharedModule} from '../shared/shared.module';
import {ActionLogsController} from './controllers/action-logs.controller';
import {CivilActController} from './controllers/civil-act.controller';
import {CivilActService} from './services/civil-act.service';

@Module({
    imports: [
        DatabaseModule,
        SharedModule,
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
        CivilActService,
    ],
    controllers: [
        IssuedDocsController,
        VerificationController,
        UserController,
        ActionLogsController,
        CivilActController,
    ],
})
export class PublicModule {}
