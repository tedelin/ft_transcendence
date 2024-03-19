import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PrivateMessageDto } from './dto/sendMessage.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FriendService } from 'src/friends/friends.service';

@Injectable()
export class PrivateMessageService {
	constructor(
		private databaseService: DatabaseService,
		private eventEmitter: EventEmitter2,
		private friendService: FriendService,
	) {}

	async sendMessage(senderId, message: PrivateMessageDto) {
		const storedMessage = await this.databaseService.privateMessage.create({
			data: {
				senderId: senderId,
				receiverId: message.receiverId,
				content: message.content,
			},
			include: {
				sender: {
					select: {
						id: true,
						username: true,
						avatar: true,
					},
				},
				receiver: {
					select: {
						id: true,
						username: true,
						avatar: true,
					},
				},
			},
		});
		this.eventEmitter.emit('private.message', senderId, message.receiverId, storedMessage);
		return storedMessage;
	}
	async getConversation(userId: number, otherUserId: number, offset: number) {
		const blockedUser = await this.friendService.findBlockedUsers(userId);
		const messages =  await this.databaseService.privateMessage.findMany({
			take: 40,
			skip: offset,
			where: {
				OR: [
					{
						senderId: userId,
						receiverId: otherUserId,
					},
					{
						senderId: otherUserId,
						receiverId: userId,
					},
				],
				senderId: {
					notIn: blockedUser.map(friendship => friendship.receiverId),
				},
			},
			include: {
				sender: {
					select: {
						id: true,
						username: true,
						avatar: true,
					},
				},
				receiver: {
					select: {
						id: true,
						username: true,
						avatar: true,
					},
				},
			},
			orderBy: {
				timestamp: 'desc',
			},
		});
		return messages.reverse();
	}

	async getAllConversations(userId: number): Promise<any[]> {
		const sentMessages = await this.databaseService.privateMessage.findMany({
			where: { senderId: userId },
			select: { receiver: {
				select: {
					id: true,
					username: true,
					avatar: true,
				},
			} },
		});
		const receivedMessages = await this.databaseService.privateMessage.findMany({
			where: { receiverId: userId },
			select: { sender: {
				select: {
					id: true,
					username: true,
					avatar: true,
				},
			} },
		});

		const allConversations = [...sentMessages.map(msg => msg.receiver), ...receivedMessages.map(msg => msg.sender)];
		const uniqueConversations = Array.from(new Set(allConversations.map(user => user.id)))
			.map(id => {
				return allConversations.find(user => user.id === id);
			});

		return uniqueConversations;
	}
}
