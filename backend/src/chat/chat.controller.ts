import { Controller, Get, Param, Delete, Post, Body, Patch, UseGuards, Req } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Prisma } from '@prisma/client';
import { ChannelMessageDto } from './dto/chat.dto';
import { JwtGuard } from 'src/auth/guard';
import { JoinChannelDto } from './dto/chat.dto';
import { UserRequest, User } from '../user/decorators/user-request.decorator';

@Controller('chat')
export class ChatController {
	constructor(
		private readonly channelService: ChannelService
	) {}

	@Get('channels')
	getPublicChannels() {
		return this.channelService.findPublicChannels();
	}

	@Post('channels')
	@UseGuards(JwtGuard)
	create(@UserRequest() user: User, @Body() createChannelDto: Prisma.ChannelCreateInput) {
		return this.channelService.create(user.id, createChannelDto);
	}
	
	@Get('channels/:name')
	getChannel(@Param('name') name: string) {
		return this.channelService.findByName(name);
	}
	
	@Patch('channels/:name')
	update(@Param('name') name: string, @Body() updateChannelDto: Prisma.ChannelUpdateInput) {
		return this.channelService.update(name, updateChannelDto);
	}
	
	@Delete('channels/:name')
	remove(@Param('name') name: string) {
		return this.channelService.remove(name);
	}

	@UseGuards(JwtGuard)
	@Post('channels/join')
	joinChannel(@UserRequest() user: User, @Body() joinChannelDto: JoinChannelDto) {
		return this.channelService.joinChannel(user.id, joinChannelDto);
	}

	@Post('channels/message')
	createMessage(@Body() createChannelMessageDto: ChannelMessageDto) {
		return this.channelService.createMessage(createChannelMessageDto);
	}

	@Get('channels/messages/:name')
	@UseGuards(JwtGuard)
	getChannelMessages(@UserRequest() user: User, @Param('name') name: string) {
		return this.channelService.findMessages(user.id, name);
	}

	@Get('channels/users/:name')
	getChannelUsers(@Param('name') name: string) {
		return this.channelService.findChannelUsers(name);
	}
}
