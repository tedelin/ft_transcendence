import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FriendService } from './friends.service';


@Module({
	imports: [DatabaseModule],
	controllers: [UserController],
	providers: [UserService, FriendService],
	exports: [UserService],
})

export class UserModule { }