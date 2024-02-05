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

    private isAlreadyConnected(userId : number) : boolean {
        for (let user of this.connectedUsers.values()) {
            if (user.id === userId)
                return true;
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
        console.log(user.username + " connected to game, id " + client.id);
        // const games = await this.roomService.formatMatchFront(await this.gameService.findAllGames());
        // console.log("<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>");
        // games.forEach(game => {
        //     console.log(`id: ${game.id}`);
        //     console.log(`Date: ${game.date}`);
        //     game.players.forEach(player => {
        //         console.log(`Player : ${player.username}, Score: ${player.score}, Role: ${player.role}`);
        //     })
        // });
        // this.server.emit('historyAllMatch', games);
    }

    async handleDisconnect(client: Socket): Promise<void> {
        let gameId : string, roomState : RoomState;
        for (const [room, roomstate] of this.roomService.rooms) {
            if (roomstate.players.includes(client)) {
                gameId = room;
                roomState = roomstate
                break;
            }
        }
        if (roomState)
        {
            if (roomState.state == RoomStatus.MATCHMAKING)
                this.roomService.matchmakingExit(client, 'disconnect', this.server);
            else if (roomState.state === RoomStatus.INGAME)
                this.roomService.closingGame(gameId, this.roomService.findMyLifePartner(gameId, client).id);
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
        console.log(client.id + " connected to room " + roomId);
    }

    @SubscribeMessage('quitInGame')
    handleCrossGame(@ConnectedSocket() client: Socket) {
        let roomId = Array.from(client.rooms)[1];
        let roomPartner = this.roomService.findMyLifePartner(roomId, client);
    
        this.roomService.closingGame(roomId, roomPartner.id);
    }

    @SubscribeMessage('crossMatchmaking')
    handleCrossSetting(@ConnectedSocket() client: Socket) {
        console.log('crossMatchmaking');
        this.roomService.matchmakingExit(client, 'cross', this.server);
    }

    @SubscribeMessage('keyAction')
    handleKeyUp(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
        let roomId = Array.from(client.rooms)[1];
        this.pongService.updatePaddlePosition(client.id, roomId, data.key, data.action);
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
                playerTwo: null
            });
        }
    }
}
