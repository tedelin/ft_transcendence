import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { Prisma } from '@prisma/client';
import { JoinChannelDto } from './dto/chat.dto';
import { ChannelMessageDto } from './dto/chat.dto';
import { FriendService } from 'src/friends/friends.service';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;

	connectedUsers: Map<string, number> = new Map();

	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly friendService: FriendService,
	) { }

	async handleConnection(client: Socket): Promise<void> {
		const token = client.handshake?.query?.token?.toString();
		const payload = this.authService.verifyAccessToken(token);
		const user = payload && await this.userService.getUserById(payload.sub);
		if (!user) {
			client.disconnect(true);
			return;
		}
		this.connectedUsers.set(client.id, user.id);
		const joinedChannels = await this.userService.getUserChannels(user.id);
		joinedChannels.channels.forEach((channel) => {
			if (channel.role === "BANNED") return ;
			client.join(channel.channelName);
		});
	}

	async handleDisconnect(client: Socket) {
		this.connectedUsers.delete(client.id);
		this.sendConnectedUsers();
	}


	@OnEvent('channel.message')
	async onChannelMessage(channelMessageDto: ChannelMessageDto, storedMessage: Prisma.ChannelMessageCreateInput) {
		const blockedUsers = await this.friendService.findBlockedByUsers(channelMessageDto.senderId);
		const blockedUsersIds = blockedUsers.map((blockedUser) => blockedUser.initiatorId);
		const socketIds = [];
		blockedUsersIds.forEach((userId) => {
			socketIds.push(this.getKeyByValue(userId));
		});
		this.server.to(channelMessageDto.channelId).except(socketIds).emit('channel-message', storedMessage);
	}

	@OnEvent('join.channel')
	async onChannelJoin(userId: number, roomId: string) {
		const client = this.getClientByUserId(userId);
		client.join(roomId);
	}

	@OnEvent('new.channel')
	async onChannel(channelDto: Prisma.ChannelCreateInput) {
		this.server.emit('new-channel', channelDto);
	}

	@OnEvent('delete.channel') 
	async onDeleteChannel(channelName: string) {
		this.server.emit('delete-channel', channelName);
	}

	@SubscribeMessage('leave.channel')
	async onChannelLeave(userId, roomId: string) {
		const client = this.getClientByUserId(userId);
		client.leave(roomId);
		this.server.to(client).emit('leave-channel', roomId);
	}


	@SubscribeMessage('typing')
	async onTyping(client: Socket, { username, roomId }) {
		client.to(roomId).emit('typing', username);
	}

	@OnEvent('kick.user')
	async onKickUser({ userId, roomId }) {
		const kickedClient = this.getClientByUserId(userId);
		kickedClient.leave(roomId);
		kickedClient.emit('kicked', roomId);
	}

	@OnEvent('ban.user')
	async onBanUser({ userId, roomId }) {
		const bannedClient = this.getClientByUserId(userId);
		bannedClient.leave(roomId);
		bannedClient.emit('banned', roomId);
	}


	@SubscribeMessage('get-connected-users')
	async onGetConnectedUsers() {
		this.sendConnectedUsers();
	}

	private sendConnectedUsers() {
		this.server.emit('connected-users', Array.from(this.connectedUsers.values()));
	}

	private getClientByUserId(userId: number): Socket | null {
		for (const [key, value] of this.connectedUsers.entries()) {
			if (value === userId) {
				const client = this.server.sockets.sockets.get(key);
				return client;
			}
		}
		return null;
	}

	private getKeyByValue(searchValue: number): string | undefined {
		for (let [key, value] of this.connectedUsers.entries()) {
			if (value === searchValue) {
				return key;
			}
		}
		return null;
	}
}