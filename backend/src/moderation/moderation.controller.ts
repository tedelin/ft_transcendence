import { Controller, Get, Param, Delete, Post, Body, Patch, UseGuards, Req, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guards';
import {Roles} from './decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserRequest, User } from '../user/decorators/user-request.decorator';
import { ModerationService } from './moderation.service';
import { Role } from '@prisma/client';


@UseGuards(JwtGuard, RolesGuard)
@Controller('moderation')
export class ModerationController {
	constructor(
		private readonly moderationService: ModerationService,
	) {}


	@Roles([Role.OWNER, Role.ADMIN])
	@Post('mute/:name/:userId')
	muteUser(@UserRequest() user: User, @Param('name') name: string, @Param('userId', ParseIntPipe) userId: number) {
		if (user.id == userId) throw new ForbiddenException('Cannot mute yourself');
		return this.moderationService.muteUser(userId, name);
	}

	@Roles([Role.OWNER, Role.ADMIN])
	@Post('unmute/:name/:userId')
	unmuteUser(@UserRequest() user: User, @Param('name') name: string, @Param('userId', ParseIntPipe) userId: number) {
		return this.moderationService.unmuteUser(userId, name);
	}

	@Roles([Role.OWNER, Role.ADMIN])
	@Patch('ban/:name/:userId')
	banUser(@UserRequest() user: User, @Param('name') name: string, @Param('userId', ParseIntPipe) userId: number) {
		if (user.id == userId) throw new ForbiddenException('Cannot ban yourself');
		return this.moderationService.banUser(userId, name);
	}

	@Roles([Role.OWNER, Role.ADMIN])
	@Patch('unban/:name/:userId')
	unbanUser(@UserRequest() user: User, @Param('name') name: string, @Param('userId', ParseIntPipe) userId: number) {
		return this.moderationService.unbanUser(userId, name);
	}

	@Roles([Role.OWNER, Role.ADMIN])
	@Delete('kick/:name/:userId')
	kickUser(@UserRequest() user: User, @Param('name') name: string, @Param('userId', ParseIntPipe) userId: number) {
		if (user.id == userId) throw new ForbiddenException('Cannot kick yourself');
		return this.moderationService.kickUser(userId, name);
	}

	@Roles([Role.OWNER])
	@Patch('promote/:name/:userId')
	promoteUser(@UserRequest() user: User, @Param('name') name: string, @Param('userId', ParseIntPipe) userId: number) {
		return this.moderationService.promoteUser(userId, name);
	}

	@Roles([Role.OWNER])
	@Patch('demote/:name/:userId')
	demoteUser(@UserRequest() user: User, @Param('name') name: string, @Param('userId', ParseIntPipe) userId: number) {
		return this.moderationService.demoteUser(userId, name);
	}
}