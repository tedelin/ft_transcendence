import {OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
	cors: {
	origin: '*',
  	},
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;

	connectedUsers: Map<string, string> = new Map();

	// constructor(private readonly chatService: ChatService) {}

	async handleConnection(client: Socket): Promise<void> {
		console.log(client.id + " connected");
	}

	async handleDisconnect(client: Socket) {
		console.log(client.id + " disconnected");
	}

	@SubscribeMessage('message')
	async onMessage(client: Socket, message: string) {
		console.log(message);
		this.server.emit('message', message);
	}
}