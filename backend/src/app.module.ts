import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [    
    ConfigModule.forRoot({
    isGlobal: true,
  }),
  ChatModule, 
  DatabaseModule, 
  AuthModule, UserModule, GameModule, ScheduleModule.forRoot()],
})
export class AppModule {}
