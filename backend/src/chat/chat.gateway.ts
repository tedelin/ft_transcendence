import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChannelService } from './channel.service';
import { PrivateMessageService } from './private-message.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { Prisma } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import { JoinChannelDto } from './dto/joinChannel.dto';
import { ChannelMessageDto } from './dto/channelMessage.dto';
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
		private readonly privateMessageService: PrivateMessageService,
		private readonly authService: AuthService,
		private readonly userService: UserService,
		) { }

	async handleConnection(client: Socket): Promise<void> {
		// const token = client.handshake.query.token.toString();
		// const payload = this.authService.verifyAccessToken(token);
		// const user = payload && await this.userService.getUserById(payload.sub);
		// if (!user) {
		// 	client.disconnect(true);
		// 	return ;
		// }
		// this.connectedUsers.set(client.id, user.id);
		// const joinedChannels = await this.userService.getUserChannels(user.id);
		// joinedChannels.channels.forEach((channel) => {
		// 	client.join(channel.channelName);
		// 	console.log(user.username + " joined " + channel.channelName);
		// });
	}

	async handleDisconnect(client: Socket) {
		console.log(client.id + " disconnected");
		this.connectedUsers.delete(client.id);
		this.sendConnectedUsers();
	}

	
	@SubscribeMessage('channel-message')
	async onChannelMessage(client: Socket, channelMessageDto: ChannelMessageDto) {
		const storedMessage = await this.channelService.createMessage(channelMessageDto);
		this.server.to(channelMessageDto.channelId).emit('channel-message', storedMessage);
	}

	@SubscribeMessage('join-channel')
	async onChannelJoin(client: Socket, joinChannelDto: JoinChannelDto) {
		const channel = await this.channelService.findByName(joinChannelDto.roomId);
		if (joinChannelDto.password && joinChannelDto.password !== '') {
			const pwMatches = await argon.verify(channel.password, joinChannelDto.password);
			if (!pwMatches) {
				throw new ForbiddenException("Wrong password");        
			}
		}
		const userChannels = await this.userService.getUserChannels(joinChannelDto.userId);
		const alreadyJoined = userChannels.channels.find((channel) => channel.channelName === joinChannelDto.roomId);
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

	@SubscribeMessage('private-message')
	async onPrivateMessage(client: Socket, privateMessageDto: Prisma.PrivateMessageCreateInput) {
		// this.privateMessageService.createMessage(privateMessageDto);
		client.to(privateMessageDto.receiverId).emit('private-message', privateMessageDto.content);
	}

	@SubscribeMessage('typing')
	async onTyping(client: Socket, username: string, receiver: string) {
		client.to(receiver).emit('typing', username);
	}

	@SubscribeMessage('get-connected-users')
	async onGetConnectedUsers(client: Socket) {
		this.sendConnectedUsers();
	}

	private sendConnectedUsers() {
		this.server.emit('connected-users', Array.from(this.connectedUsers.values()));
	}
}