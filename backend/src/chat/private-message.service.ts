import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';


@Injectable()
export class PrivateMessageService {
	constructor(private readonly databaseService: DatabaseService) {}

    async getPrivateMessages(senderId: string, receiverId: string) {
        const privateMessages = await this.databaseService.privateMessage.findMany({
            where: {
                AND: [
                    { senderId: senderId },
                    { receiverId: receiverId }
                ]
            },
            orderBy: {
                timestamp: Prisma.SortOrder.asc
            }
        });
        return privateMessages;
    }

    async createMessage(createPrivateMessageDto: Prisma.PrivateMessageCreateInput) {
        const privateMessage = await this.databaseService.privateMessage.create({
            data: createPrivateMessageDto
        });
        return privateMessage;
    }

	async deleteMessage(id: number) {
		return this.databaseService.privateMessage.delete({
			where: {
				id: id
			}
		})
	}
}