import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [ChatModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
