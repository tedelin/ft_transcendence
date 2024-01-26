import { Controller, Get, Param, Delete, Post, Body, Patch } from '@nestjs/common';
import { PrivateMessageService } from './private-message.service';
import { ChannelService } from './channel.service';
import { Prisma } from '@prisma/client';
import { ChannelMessageDto } from './dto/channelMessage.dto';

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

	@Get('channels/:name/messages')
	getChannelMessages(@Param('name') name: string) {
		return this.channelService.findMessages(name);
	}
}