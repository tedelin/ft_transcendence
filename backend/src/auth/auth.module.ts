import { Module } from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { JwtStrategy } from './strategy';

@Module({
	imports : [DatabaseModule, JwtModule.register({})],
	controllers : [AuthController],
	providers : [AuthService, JwtStrategy],
	exports : [AuthService],
})
export class AuthModule{};