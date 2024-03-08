import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { PrivateMessageController } from './privateMessage.controller';
import { PrivateMessageService } from './privateMessage.service';
import { FriendModule } from 'src/friends/friends.module';

@Module({
	imports: [DatabaseModule, FriendModule],
	controllers: [PrivateMessageController],
	providers: [PrivateMessageService, DatabaseModule],
})
export class PrivateMessageModule { }
