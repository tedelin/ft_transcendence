import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { Prisma, UserStatus } from '@prisma/client';
import { ChannelMessageDto, FriendShipRequestDto, UpdateChannelDto } from './dto/chat.dto';
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
		const alreadyConnected = this.getKeyByValue(user.id);
		if (alreadyConnected) this.server.to(alreadyConnected).emit('duplicate-login');
		this.connectedUsers.set(client.id, user.id);
		this.updateUserState(user.id, UserStatus.ONLINE);
		const joinedChannels = await this.userService.getUserChannels(user.id);
		joinedChannels.channels.forEach((channel) => {
			if (channel.role === "BANNED") return;
			client.join(channel.channelName);
		});
	}

	async handleDisconnect(client: Socket) {
		this.updateUserState(this.connectedUsers.get(client.id), UserStatus.OFFLINE);
		this.connectedUsers.delete(client.id);
	}

	@OnEvent('private.message')
	async onPrivateMessage(sender: number, receiver: number, storedMessage: Prisma.PrivateMessageCreateInput) {
		const receiverSocketId = this.getKeyByValue(receiver);
		const senderSocketId = this.getKeyByValue(sender);
		const blockedUsers = await this.friendService.findBlockedByUsers(sender);
		const blockedUsersIds = blockedUsers.map((blockedUser) => blockedUser.initiatorId);
		this.server.to(senderSocketId).emit('private-message', storedMessage);
		if (blockedUsersIds.includes(receiver)) {
			return;
		}
		this.server.to(receiverSocketId).emit('private-message', storedMessage);
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
	async onChannelJoin(userId: number, roomId: string, channelUser: Prisma.ChannelUserCreateInput) {
		const client = this.getClientByUserId(userId);
		client.join(roomId);
		this.server.to(roomId).emit('join-channel', channelUser);
	}

	@OnEvent('leave.channel')
	async onChannelLeave(userId: number, roomId: string) {
		const client = this.getClientByUserId(userId);
		client.leave(roomId);
		this.server.to(roomId).emit('leave-channel', { userId, roomId });
	}

	@OnEvent('user.role')
	async onUserRoleChange({ userId, roomId, role }) {
		this.server.to(roomId).emit('user-role', { userId, roomId, role });
	}

	@OnEvent('kick.user')
	async onKickUser({ userId, roomId }) {
		const kickedClient = this.getClientByUserId(userId);
		kickedClient.leave(roomId);
		kickedClient.emit('kicked', roomId);
		this.server.to(roomId).emit('leave-channel', { userId, roomId });
	}

	@OnEvent('ban.user')
	async onBanUser({ userId, roomId }) {
		const bannedClient = this.getClientByUserId(userId);
		bannedClient.leave(roomId);
		bannedClient.emit('banned', roomId);
		this.server.to(roomId).emit('user-role', { userId, roomId, role: 'BANNED' });
	}

	@OnEvent('user.muted')
	async onMutedUser(userId: number, roomId: string, muted: boolean) {
		this.server.to(roomId).emit('user-muted', { userId, roomId, muted });
	}
	
	@OnEvent('new.channel')
	async onChannel(channelDto: Prisma.ChannelCreateInput) {
		this.server.emit('new-channel', channelDto);
	}

	@OnEvent('update.channel')
	async onUpdateChannel(channelDto: UpdateChannelDto) {
		this.server.to(channelDto.name).emit('update-channel', channelDto);
	}

	@OnEvent('delete.channel')
	async onDeleteChannel(channelName: string) {
		this.server.emit('delete-channel', channelName);
	}

	@SubscribeMessage('typing')
	async onTyping(client: Socket, { username, roomId }) {
		client.to(roomId).emit('typing', username);
	}

	@OnEvent('user.state')
	async updateUserState(userId: number, state: UserStatus) {
		if (!userId) return;
		const userFriends = await this.friendService.getFriendships(userId);
		const friendsIds = userFriends.map((friend) => {
			if (friend.initiatorId === userId) {
				return friend.receiverId;
			}
			return friend.initiatorId;
		});
		const friendsSockets = [];
		friendsIds.forEach((id) => {
			const socketId = this.getKeyByValue(id);
			if (socketId) {
				friendsSockets.push(socketId);
			}
		});
		this.userService.updateUserState(userId, state);
		this.server.to(friendsSockets).emit('user-state', { userId, state });
	}

	@OnEvent('friendship.update')
	async onFriendshipRequest(friendship: FriendShipRequestDto) {
		const receiverSocketId = this.getKeyByValue(friendship.receiverId);
		const initiatorSocketId = this.getKeyByValue(friendship.initiatorId);
		this.server.to(receiverSocketId).emit('friendship', friendship);
		this.server.to(initiatorSocketId).emit('friendship', friendship);
	}

	@OnEvent('friendship.delete')
	async onFirendshipDelete(friendship: FriendShipRequestDto) {
		const receiverSocketId = this.getKeyByValue(friendship.receiverId);
		const initiatorSocketId = this.getKeyByValue(friendship.initiatorId);
		this.server.to(receiverSocketId).emit('friendship-delete', friendship);
		this.server.to(initiatorSocketId).emit('friendship-delete', friendship);
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