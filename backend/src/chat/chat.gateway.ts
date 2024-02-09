import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChannelService } from './channel.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { Prisma } from '@prisma/client';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { JoinChannelDto } from './dto/joinChannel.dto';
import { ChannelMessageDto } from './dto/channelMessage.dto';
import { FriendService } from 'src/friends/friends.service';
import * as argon from 'argon2';

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;

	connectedUsers: Map<string, number> = new Map();

	constructor(private readonly channelService: ChannelService,
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
			if (channel.role === "BANNED") {
				return ;
			}
			client.join(channel.channelName);
			console.log(user.username + " joined " + channel.channelName);
		});
	}

	async handleDisconnect(client: Socket) {
		this.connectedUsers.delete(client.id);
		this.sendConnectedUsers();
	}


	@SubscribeMessage('channel-message')
	async onChannelMessage(client: Socket, channelMessageDto: ChannelMessageDto) {
		const storedMessage = await this.channelService.createMessage(channelMessageDto);
		const blockedUsers = await this.friendService.findBlockedByUsers(channelMessageDto.senderId);
		const blockedUsersIds = blockedUsers.map((blockedUser) => blockedUser.initiatorId);
		const socketIds = [];
		blockedUsersIds.forEach((userId) => {
			socketIds.push(this.getKeyByValue(userId));
		});
		this.server.to(channelMessageDto.channelId).except(socketIds).emit('channel-message', storedMessage);
	}

	@SubscribeMessage('join-channel')
	async onChannelJoin(client: Socket, joinChannelDto: JoinChannelDto) {
		const channel = await this.channelService.findByName(joinChannelDto.roomId);
		if (!channel) {
			throw new ForbiddenException("Channel not found");
		}
		if (joinChannelDto.password && joinChannelDto.password !== '') {
			const pwMatches = await argon.verify(channel.password, joinChannelDto.password);
			if (!pwMatches) {
				throw new ForbiddenException("Wrong password");
			}
		}
		const userChannels = await this.userService.getUserChannels(joinChannelDto.userId);
		const alreadyJoined = userChannels.channels.find((channel) => channel.channelName === joinChannelDto.roomId);
		console.log(alreadyJoined);
		if (alreadyJoined && alreadyJoined.role == "BANNED") {
			return ;
		}
		if (!alreadyJoined) {
			this.channelService.joinChannel(joinChannelDto);
		}
		client.join(joinChannelDto.roomId);
	}

	@SubscribeMessage('leave-channel')
	async onChannelLeave(client: Socket, roomId: string) {
		// console.log(client.id + " leaved " + roomId);
		client.leave(roomId);
		// client.to(roomId).emit('channel-message', "User " + client.id + " leaved the channel");
	}

	@SubscribeMessage('new-channel')
	async onChannel(client: Socket, channelDto: Prisma.ChannelCreateInput) {
		this.server.emit('new-channel', channelDto);
	}

	@SubscribeMessage('typing')
	async onTyping(client: Socket, { username, roomId }) {
		client.to(roomId).emit('typing', username);
	}

	@SubscribeMessage('kick-user')
	async onKickUser(client: Socket, { userId, roomId }) {
		// Add check if user is admin
		const kickedClient = this.getClientByUserId(userId);
		this.channelService.kickUser(userId, roomId);
		kickedClient.leave(roomId);
		kickedClient.emit('kicked', roomId);
	}

	@SubscribeMessage('ban-user')
	async onBanUser(client: Socket, { userId, roomId }) {
		// Add check if user is admin
		const bannedClient = this.getClientByUserId(userId);
		this.channelService.banUser(userId, roomId);
		bannedClient.leave(roomId);
		bannedClient.emit('banned', roomId);
	}


	@SubscribeMessage('get-connected-users')
	async onGetConnectedUsers(client: Socket) {
		this.sendConnectedUsers();
	}

	private sendConnectedUsers() {
		this.server.emit('connected-users', Array.from(this.connectedUsers.values()));
	}

	private getClientByUserId(userId: number): Socket | null {
		for (const [key, value] of this.connectedUsers.entries()) {
		  if (value === userId) {
			const kickedClient = this.server.sockets.sockets.get(key);
	
			return kickedClient;
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