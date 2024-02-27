import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FriendModule } from './friends/friends.module';
import { ModerationModule } from './moderation/moderation.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrivateMessageModule } from './privateMessage/privateMessage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatModule, 
    DatabaseModule, 
    AuthModule, 
    UserModule, 
    GameModule, 
    FriendModule,
    PrivateMessageModule,
	ModerationModule,
    ScheduleModule.forRoot(),
	EventEmitterModule.forRoot()
  ],
})
export class AppModule {}
