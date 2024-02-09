import { Controller, Get, Param, Delete, Post, Body, Patch, UseGuards, Req } from '@nestjs/common';
import { PrivateMessageService } from './private-message.service';
import { ChannelService } from './channel.service';
import { Prisma } from '@prisma/client';
import { ChannelMessageDto } from './dto/channelMessage.dto';
import { JwtGuard } from 'src/auth/guard';

@Controller('chat')
export class ChatController {
	constructor(private readonly privateMessageService: PrivateMessageService,
		private readonly channelService: ChannelService) { }

	@Get('channels')
	getPublicChannels() {
		return this.channelService.findPublicChannels();
	}

	@Post('channels')
	create(@Body() createChannelDto: Prisma.ChannelCreateInput) {
		return this.channelService.create(createChannelDto);
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

	@Post('channels/messages')
	createMessage(@Body() createChannelMessageDto: ChannelMessageDto) {
		return this.channelService.createMessage(createChannelMessageDto);
	}

	@Get('channels/messages/:name')
	@UseGuards(JwtGuard)
	getChannelMessages(@Param('name') name: string, @Req() user: any) {
		return this.channelService.findMessages(user.id, name);
	}

	@Get('channels/users/:name')
	getChannelUsers(@Param('name') name: string) {
		return this.channelService.findChannelUsers(name);
	}

	// @Delete('channels/kick/:name/:userId')
	// kickUser(@Param('name') name: string, @Param('userId') userId: number) {
	// }
}
