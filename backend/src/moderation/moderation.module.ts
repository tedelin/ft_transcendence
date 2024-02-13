import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';

@Module({
	imports: [DatabaseModule, AuthModule],
	controllers: [ModerationController],
	providers: [ModerationService],
	exports: [ModerationService],
})

export class ModerationModule {}