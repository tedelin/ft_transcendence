import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { ChannelService } from './channel.service';
import { ChatController } from './chat.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { FriendModule } from 'src/friends/friends.module';

@Module({
	imports: [DatabaseModule, AuthModule, UserModule, FriendModule],
	controllers: [ChatController],
	providers: [ChatGateway, ChannelService],
})

export class ChatModule {}
