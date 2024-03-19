import { Controller, Get, Param, Delete, Post, Body, Patch, UseGuards, Req, Query } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Prisma } from '@prisma/client';
import { ChannelMessageDto, CreateChannelDto, UpdateChannelDto } from './dto/chat.dto';
import { JwtGuard } from 'src/auth/guard';
import { JoinChannelDto } from './dto/chat.dto';
import { UserRequest, User } from '../user/decorators/user-request.decorator';
import { RolesGuard } from 'src/moderation/guards/roles.guards';
import { Roles } from 'src/moderation/decorators/roles.decorator';

@Controller('chat')
export class ChatController {
	constructor(
		private readonly channelService: ChannelService
	) { }

	@Get('channels')
	getPublicChannels() {
		return this.channelService.findPublicChannels();
	}

	@UseGuards(JwtGuard)
	@Get('channels/search')
	searchChannels(@Query('search') query: string = '') {
		return this.channelService.searchPublicChannels(query);
	}


	@UseGuards(JwtGuard)
	@Post('channels')
	create(@UserRequest() user: User, @Body() createChannelDto: CreateChannelDto) {
		return this.channelService.create(user.id, createChannelDto);
	}

	@Get('channels/:name')
	getChannel(@Param('name') name: string) {
		return this.channelService.findByName(name);
	}

	@UseGuards(JwtGuard, RolesGuard)
	@Roles(['OWNER'])
	@Patch('channels/:name')
	update(@Param('name') name: string, @Body() updateChannelDto: UpdateChannelDto) {
		return this.channelService.update(name, updateChannelDto);
	}

	@UseGuards(JwtGuard)
	@Post('channels/join')
	joinChannel(@UserRequest() user: User, @Body() joinChannelDto: JoinChannelDto) {
		return this.channelService.joinChannel(user.id, joinChannelDto);
	}

	@UseGuards(JwtGuard)
	@Post('channels/leave')
	leaveChannel(@UserRequest() user: User, @Body('roomId') roomId: string) {
		return this.channelService.leaveChannel(user.id, roomId);
	}

	@UseGuards(JwtGuard, RolesGuard)
	@Roles(['MEMBER', 'ADMIN', 'OWNER'])
	@Post('channels/:name/message')
	createMessage(@Body() createChannelMessageDto: ChannelMessageDto) {
		return this.channelService.createMessage(createChannelMessageDto);
	}

	@UseGuards(JwtGuard, RolesGuard)
	@Roles(['MEMBER', 'ADMIN', 'OWNER'])
	@Get('channels/messages/:name')
	getChannelMessages(@UserRequest() user: User, @Query('offset') offset: number = 0, @Param('name') name: string) {
		return this.channelService.findMessages(user.id, name, +offset);
	}

	@Get('channels/users/:name')
	getChannelUsers(@Param('name') name: string) {
		return this.channelService.findChannelUsers(name);
	}

	@UseGuards(JwtGuard)
	@Get('channels/membership/:name')
	async getMembership(@UserRequest() user: User, @Param('name') name: string) {
		return this.channelService.verifyMembership(user.id, name);
	}
}
