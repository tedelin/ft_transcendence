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

  // async getMessagesBetweenUsers(userId1: number, userId2: number) {
  //   return this.databaseService.privateMessage.findMany({
  //     where: {
  //       OR: [
  //         { senderId: userId1, receiverId: userId2 },
  //         { senderId: userId2, receiverId: userId1 },
  //       ],
  //     },
  //     orderBy: {
  //       createdAt: 'asc',
  //     },
  //   });
  // }

  // async getMessagesBetweenUsers(userId: number, otherUserId: string) {
  //   const otherUserIdInt = parseInt(otherUserId, 10); // Convertit otherUserId en entier
  //   if (isNaN(otherUserIdInt)) {
  //     throw new Error('otherUserId doit être un nombre');
  //   }
    
  //   return await this.databaseService.privateMessage.findMany({
  //     where: {
  //       OR: [
  //         { senderId: userId, receiverId: otherUserIdInt },
  //         { senderId: otherUserIdInt, receiverId: userId },
  //       ],
  //     },
  //     orderBy: {
  //       createdAt: 'asc',
  //     },
  //   });
  // }

  async getMessagesBetweenUsers(userId: number, otherUserId: number) {
    // Assurez-vous que both userId et otherUserId sont des nombres.
    // Aucune conversion n'est nécessaire ici si vous vous assurez déjà que
    // les valeurs sont correctes avant d'appeler cette méthode.
    return await this.databaseService.privateMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getAllConversations(userId: number): Promise<any[]> {
    const sentMessages = await this.databaseService.privateMessage.findMany({
      where: { senderId: userId },
      select: { receiver: true },
    });
    const receivedMessages = await this.databaseService.privateMessage.findMany({
      where: { receiverId: userId },
      select: { sender: true },
    });
  
    const allConversations = [...sentMessages.map(msg => msg.receiver), ...receivedMessages.map(msg => msg.sender)];
    const uniqueConversations = Array.from(new Set(allConversations.map(user => user.id)))
      .map(id => {
        return allConversations.find(user => user.id === id);
      });
  
    return uniqueConversations;
  }
}
