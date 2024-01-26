import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { PrivateMessageService } from './private-message.service';
import { ChannelService } from './channel.service';
import { ChatController } from './chat.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [DatabaseModule, AuthModule, UserModule],
	controllers: [ChatController],
	providers: [ChatGateway, PrivateMessageService, ChannelService],
})

export class ChatModule {}
