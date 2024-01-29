import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { FriendService } from '../friends/friends.service';
import { FriendController } from './friends.controller';


@Module({
	imports: [DatabaseModule],
	controllers: [FriendController],
	providers: [FriendService],
	exports: [FriendService],
})

export class FriendModule { }