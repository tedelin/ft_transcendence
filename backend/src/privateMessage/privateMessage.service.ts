import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
@Injectable()
export class PrivateMessageService {
  constructor(private databaseService: DatabaseService) {}

  async sendMessage(senderId: number, receiverId: number, content: string) {
    return this.databaseService.privateMessage.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number) {
    return this.databaseService.privateMessage.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

}
