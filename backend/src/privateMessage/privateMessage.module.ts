import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { PrivateMessageController } from './privateMessage.controller';
import { PrivateMessageService } from './privateMessage.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PrivateMessageController],
  providers: [PrivateMessageService, DatabaseModule],
})
export class PrivateMessageModule {}
