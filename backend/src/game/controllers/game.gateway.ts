import { Server, Socket } from "socket.io";
import {
    WebSocketGateway,
    WebSocketServer,
    MessageBody,
    SubscribeMessage,
    ConnectedSocket,
    OnGatewayInit
} from '@nestjs/websockets';
import { RoomService } from "../services/room.service";
import { PongService } from "../services/pong.service";
import { pData, RoomState, GameSettings, RoomStatus } from '../classes/room';
import { AuthService } from "src/auth/auth.service";
import { UserService } from "src/user/user.service";
import { GameService } from "../services/game.service";

interface PlayerInfo {
	id: number;
	username: string;
	avatar: string;
}
import { Player as PlayerDto } from "../dto/create-match.dto";


@WebSocketGateway({
    cors: {
        origin: '*',
    }
})

export class GameGateway implements OnGatewayInit {
    @WebSocketServer() server: Server;
    connectedUsers: Map<string, PlayerInfo> = new Map();

    constructor(
        private readonly roomService: RoomService,
        private readonly pongService: PongService,
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly gameService: GameService
    ) { }

    afterInit(server: Server) {
        this.roomService.setServer(server, this.connectedUsers);
    }

    private cleanUpSpectator(client: Socket) {
        for (const [room, roomState] of this.roomService.rooms.entries()) {
            const spectIndex = roomState.spectators.findIndex(s => s.id === client.id);
            if (spectIndex !== -1) {
                roomState.spectators.splice(spectIndex, 1);
                client.leave(room);
                break;
            }
        }
    }

    private isASpectator(client: Socket): boolean {
        for (const roomState of this.roomService.rooms.values()) {
            if (roomState.spectators.some(spectator => spectator.id === client.id)) {
                return true;
            }
        }
        return false;
    }

    async handleConnection(client: Socket): Promise<void> {
        const token = client.handshake.query.token.toString();
        const payload = this.authService.verifyAccessToken(token);
        const user = payload && await this.userService.getUserById(payload.sub);
        if (!user) {
            client.disconnect(true);
            return;
        }
        this.connectedUsers.set(client.id, user);
        this.roomService.playersData.set(client.id, new pData(user.id));
        this.gameService.createStats(user.id);
        this.gameService.createAchivement(user.id);
    }

    public getArraySpectator(roomId: string) {
        const spectatorSockets = this.roomService.rooms.get(roomId).spectators;
        const usernames = spectatorSockets.map(socket => this.connectedUsers.get(socket.id).username);
        if (usernames === undefined || !usernames) {
            return [];
        }
        return usernames;
    }

    async handleDisconnect(client: Socket): Promise<void> {
        let gameId: string, roomState: RoomState;
        for (const [room, roomstate] of this.roomService.rooms) {
            if (roomstate.players.includes(client) || roomstate.spectators.includes(client)) {
                gameId = room;
                roomState = roomstate
                break;
            }
        }
        if (roomState) {
            if (this.isASpectator(client)) {
                const spectator = this.connectedUsers.get(client.id);
                this.cleanUpSpectator(client);
                this.server.to(gameId).emit('spectators', { spectators: this.getArraySpectator(gameId) });
                this.roomService.logRooms();
            }
            else if (roomState.state == RoomStatus.MATCHMAKING) {
                this.roomService.matchmakingExit(client, 'disconnect', this.server);
            }
            else if (roomState.state === RoomStatus.INGAME || roomState.state === RoomStatus.LAUNCHING)
                this.roomService.closingGame(gameId, this.roomService.findMyLifePartner(gameId, client).id, false);
        }
        if (this.connectedUsers.get(client.id)) {
            this.connectedUsers.delete(client.id);
        }
        this.roomService.playersData.delete(client.id);
        this.roomService.logRooms();
    }


    @SubscribeMessage('getInvitation')
    getInvitation(@ConnectedSocket() client: Socket, @MessageBody() friendId: number) {
        const userId = this.connectedUsers.get(client.id).id;
        this.roomService.privateRooms.forEach((value: [number, number], roomId: string) => {
            const [creatorId, joinerId] = value;
            if (creatorId == friendId && joinerId == userId) {
                this.server.to(client.id).emit('game-invite', roomId);
            }
        });
    }

    @SubscribeMessage('clickPlay')
    handleClickPlay(@ConnectedSocket() client: Socket) {
        const room = this.roomService.findAvailableRoom() || this.roomService.createRoom(client);
        let roomId = this.roomService.assignClientToRoom(client, room);
    }

    @SubscribeMessage('inviteToPlay')
    handlePrivatePlay(@ConnectedSocket() client: Socket, @MessageBody() userId: number) {
        const receiverId = this.getClientByUserId(userId);
        const roomId = this.roomService.createPrivateRoom(client, userId);
        this.server.to(receiverId).emit('game-invite', roomId);
    }

    @SubscribeMessage('acceptInvite')
    handleAcceptInvite(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
        this.roomService.joinPrivateRoom(client, roomId);
    }

    @SubscribeMessage('returnBack')
    handleReturnBack(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
        const roomsArray = Array.from(client.rooms);
		let roomId: string = roomsArray[roomsArray.length - 1];
        let roomState = this.roomService.rooms.get(roomId);
        if ((roomState && roomState.state === RoomStatus.LAUNCHING) || (data.gameInstance))
            this.quitInGame(client);
        else if (!data.gameInstance)
            this.roomService.matchmakingExit(client, 'cross', this.server);
    }

    public quitInGame(client: Socket) {
        const roomsArray = Array.from(client.rooms);
		let roomId = roomsArray[roomsArray.length - 1];
        let roomPartner = this.roomService.findMyLifePartner(roomId, client);
        if (this.isASpectator(client)) {
            const spectator = this.connectedUsers.get(client.id);
            this.cleanUpSpectator(client);
            this.server.to(roomId).emit('spectators', { spectators: this.getArraySpectator(roomId) });
            this.roomService.logRooms();
        }
        else if (roomPartner)
            this.roomService.closingGame(roomId, roomPartner.id, false);
    }

    @SubscribeMessage('quitInGame')
    handleCrossGame(@ConnectedSocket() client: Socket) {
        this.quitInGame(client);
    }

    @SubscribeMessage('crossMatchmaking')
    handleCrossSetting(@ConnectedSocket() client: Socket) {
        this.roomService.matchmakingExit(client, 'cross', this.server);
    }

    @SubscribeMessage('keyAction')
    handleKeyUp(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
        const roomsArray = Array.from(client.rooms);
		let roomId = roomsArray[roomsArray.length - 1];
        let roomState = this.roomService.rooms.get(roomId);
        if (!roomState || !roomState.players.some(player => player.id === client.id)) {
            return;
        }
        this.pongService.updatePaddlePosition(client.id, roomId, data.key, data.action);
    }

    @SubscribeMessage('viewMatch')
    handleViewMatch(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
        const userId = data.userId;
        let userSocketId: string | null = null;
        for (let [socketId, user] of this.connectedUsers.entries()) {
            if (user.id === userId) {
                userSocketId = socketId;
                break;
            }
        }
        if (!userSocketId) {
            return;
        }
        let roomId: string | null = null;
        for (let [room, roomState] of this.roomService.rooms.entries()) {
            if (roomState.players.some(socket => socket.id === userSocketId)) {
                roomId = room;
                break;
            }
        }
        if (!roomId) {
            return;
        }
        const roomState = this.roomService.rooms.get(roomId);
        if (roomState) {
            client.join(roomId);
            if (!roomState.spectators.includes(client)) {
                roomState.spectators.push(client);
            }
        }
        client.emit('gameLaunch', { gameState: roomState.gameState, spectators: this.getArraySpectator(roomId) });
        const playerOne: PlayerDto = {
            id: this.connectedUsers.get(roomState.players[0].id).username,
            avatar: this.connectedUsers.get(roomState.players[0].id).avatar
        };

        const playerTwo: PlayerDto | null = roomState.players.length < 2 ? null : {
			id: this.connectedUsers.get(roomState.players[1].id).username,
            avatar: this.connectedUsers.get(roomState.players[1].id).avatar
        };
        
        this.server.to(roomId).emit('matchmakingStats', {
            playerOne: playerOne,
            playerTwo: playerTwo,
            roomId: roomId
        })
        this.server.to(roomId).emit('spectators', { spectators: this.getArraySpectator(roomId) });
        this.roomService.logRooms();
    }

    @SubscribeMessage('clickSaveSettings')
    handleClickSaveSettings(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		const roomsArray = Array.from(client.rooms);
		let roomId = roomsArray[roomsArray.length - 1];
        let roomState = this.roomService.rooms.get(roomId);

        roomState.settings = new GameSettings(
            data.ballSpeed,
            data.ballSize,
            data.paddleSpeed,
            data.paddleHeight,
            data.increasedBallSpeed,
            true
        );
        if (roomState.players.length == this.roomService.roomSize) {
            this.roomService.startGame(
                roomId,
                this.roomService.playersData.get(roomState.players[0].id),
                this.roomService.playersData.get(roomState.players[1].id),
                roomState.settings
            );
        }
        else {
            client.emit('gameMatchmaking', {
                settingDone: true,
                firstPlayer: true
            });
            const playerOne: PlayerDto = {
                id: this.connectedUsers.get(client.id).username,
                avatar: this.connectedUsers.get(client.id).avatar
            };
            client.emit('matchmakingStats', {
                playerOne: playerOne,
                playerTwo: null,
                roomId: roomId
            });
        }
    }


    getClientByUserId(userId: number): string | undefined {
        for (const [key, user] of this.connectedUsers.entries()) {
            if (user.id === userId) {
                return key;
            }
        }
        return undefined;
    }
}
