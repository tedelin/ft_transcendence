import { Body, Controller, Get, Param, Post, UseGuards, Query } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { User } from 'src/user/decorators/user.decorator';
import { PrivateMessageService } from './privateMessage.service';
import { SendMessageDto } from './dto/sendMessage.dto';

@Controller('private-messages')
export class PrivateMessageController {
  constructor(private readonly privateMessageService: PrivateMessageService) {}

  @UseGuards(JwtGuard)
  @Post()
  async sendMessage(@User() user: any, @Body() sendMessageDto: SendMessageDto) {
    console.log('sendMessageDto', sendMessageDto);
    return this.privateMessageService.sendMessage(user.id, sendMessageDto.receiverId, sendMessageDto.content);
  }

  // @UseGuards(JwtGuard)
  // @Get(':userId')
  // async getMessagesWithUser(@User() user: any, @Param('userId') userId: number) {
  //   return this.privateMessageService.getMessagesBetweenUsers(user.id, userId);
  // }

  @UseGuards(JwtGuard)
  @Get()
  async getMessagesBetweenTwoUsers(
    @Query('userId1') userId1: string,
    @Query('userId2') userId2: string,
  ) {
    return this.privateMessageService.getMessagesBetweenUsers(+userId1, +userId2);
  }
}
