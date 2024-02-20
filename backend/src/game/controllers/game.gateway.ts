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
import { User } from "@prisma/client";
import { GameService } from "../services/game.service";

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})

export class GameGateway implements OnGatewayInit
{
    @WebSocketServer() server: Server;
    connectedUsers: Map<string, User> = new Map();

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
                roomState.spectators.splice(spectIndex, 1); // Nettoyage des spectateurs
                client.leave(room); // Le client quitte la room
                console.log(`Spectator ${client.id} has left room ${room}`);
                console.log(`LENGTH OF SPECTATORS VECTOR AFTER HE LEFT ROOM : ${roomState.spectators.length}`);
                break;
            }
        }
    }

    private isASpectator(client: Socket): boolean {
        for (const roomState of this.roomService.rooms.values()) {
            if (roomState.spectators.some(spectator => spectator.id === client.id)) {
                console.log(`${client.id} is a spectator!!!`);
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
			return ;
		}
        this.connectedUsers.set(client.id, user);
        this.roomService.playersData.set(client.id, new pData(user.id));
        console.log(this.connectedUsers.get(client.id).username + " connected to game, id " + client.id);
        await this.gameService.createStats(this.connectedUsers.get(client.id).id);
    }

    async handleDisconnect(client: Socket): Promise<void> {
        let gameId : string, roomState : RoomState;
        for (const [room, roomstate] of this.roomService.rooms) {
            if (roomstate.players.includes(client) || roomstate.spectators.includes(client)) {
                gameId = room;
                roomState = roomstate
                break;
            }
        }
        if (roomState)
        {
            console.log("in roomstate");
            if (this.isASpectator(client))
                this.cleanUpSpectator(client);
            else if (roomState.state == RoomStatus.MATCHMAKING)
                this.roomService.matchmakingExit(client, 'disconnect', this.server);
            else if (roomState.state === RoomStatus.INGAME)
                this.roomService.closingGame(gameId, this.roomService.findMyLifePartner(gameId, client).id, client.id);
        }
        console.log(this.connectedUsers.get(client.id).username + " disconnected from game");
        this.connectedUsers.delete(client.id);
        this.roomService.playersData.delete(client.id);
        this.roomService.logRooms();
    }


    @SubscribeMessage('clickPlay')
    handleClickPlay(@ConnectedSocket() client: Socket) {
		console.log("clickplay");
        let roomId = this.roomService.assignClientToRoom(client);
        console.log(this.connectedUsers.get(client.id).username + " connected to room " + roomId);
    }

    @SubscribeMessage('quitInGame')
    handleCrossGame(@ConnectedSocket() client: Socket) {
        let roomId = Array.from(client.rooms)[1];
        let roomPartner = this.roomService.findMyLifePartner(roomId, client);
        
        if (this.isASpectator(client)) {
            this.cleanUpSpectator(client);
            this.roomService.logRooms();
        }
        else
            this.roomService.closingGame(roomId, roomPartner.id, client.id);
    }

    @SubscribeMessage('crossMatchmaking')
    handleCrossSetting(@ConnectedSocket() client: Socket) {
        console.log('crossMatchmaking');
        this.roomService.matchmakingExit(client, 'cross', this.server);
    }

    @SubscribeMessage('keyAction')
    handleKeyUp(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
        let roomId = Array.from(client.rooms)[1];
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
            console.log("User socket not found");
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
            console.log("Room not found");
            return;
        }
        const roomState = this.roomService.rooms.get(roomId);
        if (roomState) {
            client.join(roomId);
            if (!roomState.spectators.includes(client))
                roomState.spectators.push(client);
        }
        else
            console.log("no roomState");
        console.log(`roomId : ${roomId}, spectator ${userSocketId} added` );
        client.emit('gameLaunch', { gameState: roomState.gameState });
        this.roomService.logRooms();
    }

    @SubscribeMessage('clickSaveSettings')
    handleClickSaveSettings(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
        let roomId = (Array.from(client.rooms))[1];
        let roomPartner = this.roomService.findMyLifePartner(roomId, client);
        let roomState = this.roomService.rooms.get(roomId);

        roomState.settings = new GameSettings(
            data.ballSpeed,
            data.ballSize,
            data.paddleSpeed, 
            data.paddleHeight,
            data.increasedBallSpeed, 
            true
        );
		console.log("CLick save settings");
        if (roomState.players.length == this.roomService.roomSize){
            this.roomService.startGame(
                roomId,
                this.roomService.playersData.get(roomState.players[0].id), 
                this.roomService.playersData.get(roomState.players[1].id), 
                roomState.settings
            );
        }
        else {
            client.emit('gameMatchmaking', { 
                settingDone : true, 
                firstPlayer : true
            });
            client.emit('matchmakingStats', {
                playerOne: { id: roomState.players[0].id.substring(0, 5) },
                playerTwo: null,
                roomId: roomId
            });
        }
    }
}
