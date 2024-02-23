import { Body, Controller, Get, Param, Post, UseGuards, Query, BadRequestException } from '@nestjs/common';
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

  // @UseGuards(JwtGuard)
  // @Get()
  // async getMessagesBetweenTwoUsers(
  //   @Query('userId1') userId1: string,
  //   @Query('userId2') userId2: string,
  // ) {
  //   return this.privateMessageService.getMessagesBetweenUsers(+userId1, +userId2);
  // }

  // @UseGuards(JwtGuard)
  // @Get()
  // async getMessages(@User() user: any, @Query('otherUserId') otherUserId: number) {
  //   console.log('user', user);
  //   return await this.privateMessageService.getMessagesBetweenUsers(user.id, +otherUserId);
  // }

  @UseGuards(JwtGuard)
  @Get()
  async getMessages(@User() user: any, @Query('otherUserId') otherUserId: string) {
    // Convertit otherUserId en nombre.
    const otherUserIdNumber = parseInt(otherUserId, 10);
    if (isNaN(otherUserIdNumber)) {
      throw new BadRequestException('otherUserId doit être un nombre valide.');
    }
    
    return await this.privateMessageService.getMessagesBetweenUsers(user.id, otherUserIdNumber);
  }

  @UseGuards(JwtGuard)
  @Get('conversations')
  async getAllUserConversations(@User() user: any) {
    return this.privateMessageService.getAllConversations(user.id);
  }
}
