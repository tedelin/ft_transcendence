import { Body, Controller, Get, Param, Post, UseGuards, Query, BadRequestException, Req, ParseIntPipe } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { PrivateMessageService } from './privateMessage.service';
import { PrivateMessageDto } from './dto/sendMessage.dto';
import { User, UserRequest } from 'src/user/decorators/user-request.decorator';



@Controller('private-messages')
export class PrivateMessageController {
	constructor(private readonly privateMessageService: PrivateMessageService) { }

	@UseGuards(JwtGuard)
	@Post()
	async sendMessage(@UserRequest() user: User, @Body() message: PrivateMessageDto) {
		return this.privateMessageService.sendMessage(user.id, message);
	}
	
	@UseGuards(JwtGuard)
	@Get('conversations')
	async getAllUserConversations(@UserRequest() user: User) {
		return this.privateMessageService.getAllConversations(user.id);
	}

	@UseGuards(JwtGuard)
	@Get(':userId')
	async getMessagesWith(@UserRequest() user: User, @Param('userId', ParseIntPipe) userId: number, @Query('offset') offset: number = 0) {
		return this.privateMessageService.getConversation(user.id, userId, +offset);
	}

}
