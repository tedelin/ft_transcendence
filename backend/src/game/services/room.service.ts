import { Injectable } from "@nestjs/common";
import { Interval } from '@nestjs/schedule';
import { Socket, Server } from 'socket.io';
import { pData, GameSettings, RoomState, RoomStatus } from '../classes/room'
import { GameStatus, Score } from "../classes/pong";
import { PongService } from "./pong.service";
import { GameService } from "./game.service";
import { CreateMatchDto, PlayerData } from "../dto/create-match.dto";
import { UserStatus } from "@prisma/client";
import { UpdateMatchDto } from "../dto/update-match.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Player as PlayerDto } from "../dto/create-match.dto";

interface Matchs {
    id: number,
    date: any,
    players: Array<{
        username: string,
        score: number,
        role: string
    }>
}

interface PlayerInfo {
	id: number;
	username: string;
	avatar: string;
}

@Injectable()
export class RoomService {

    public rooms: Map<string, RoomState> = new Map();
    public playersData: Map<string, pData> = new Map();
    public roomSize = 2;
    public server: Server;
    public connectedUsers: Map<string, PlayerInfo>;
    public privateRooms: Map<string, [number, number]> = new Map();

    constructor(
        private readonly pongService: PongService,
        private readonly gameService: GameService,
		private readonly eventEmitter: EventEmitter2,	
    ) { }

    public setServer(server: Server, connectedUsers: Map<string, PlayerInfo>) {
        this.server = server;
        this.connectedUsers = connectedUsers;
    }

    public matchmakingExit(client: Socket, action: string, server) {
        let gameId: string, roomState: RoomState;
        for (const [room, roomstate] of this.rooms) {
            if (roomstate.players.includes(client)) {
                gameId = room;
                roomState = roomstate
                break;
            }
        }
        if (!roomState)
            return;

        const isPlayerOne = (client.id === roomState.players[0].id);
        if (isPlayerOne)
            this.playerOneMatchmakingExit(gameId, client);
        else if (roomState.players.length > 1)
            this.playerTwoMatchmakingExit(gameId, client);

        if (action === 'cross')
            client.emit('backToMenu');
    }

    private playerTwoMatchmakingExit(gameId, client) {
        const roomState = this.rooms.get(gameId);
        if (!roomState)
            return;

        roomState.players = roomState.players.filter(c => c.id !== client.id);
        client.leave(gameId);
        this.server.to(gameId).emit('matchmakingStats', {
            playerOne: { id: this.connectedUsers.get(client.id).username, avatar: this.connectedUsers.get(client.id).avatar },
            playerTwo: null,
            roomId: gameId
        })
    }

    private playerOneMatchmakingExit(gameId, client) {
		const roomState = this.rooms.get(gameId);
        if (!roomState) return;
        if (this.privateRooms.has(gameId)) {
            const waitingUser = this.privateRooms.get(gameId)[1];
            const waitingClient = this.server.sockets.sockets.get(this.getClientByUserId(waitingUser));
            this.matchmakingExit(waitingClient, 'cross', this.server);
            this.cleanRoom(gameId);
            return;
        }
        let roomPartner: Socket | null = this.findMyLifePartner(gameId, client);
        this.cleanRoom(gameId);
        if (roomPartner) {
            const roomId = this.findAvailableRoom() || this.createRoom(roomPartner);
            this.assignClientToRoom(roomPartner, roomId);
        }
    }

    public logRooms() {
        this.rooms.forEach((roomState, roomId) => {
            const playerUsernames = roomState.players.map(playerSocket => {
                const user = this.connectedUsers.get(playerSocket.id);
                return user ? user.username : "Unknown";
            }).join(', ');
            const spectatorUsernames = roomState.spectators.map(spectatorSocket => {
                const user = this.connectedUsers.get(spectatorSocket.id);
                return user ? user.username : "Unknown";
            }).join(', ');
        });
    }

    public assignClientToRoom(client: Socket, roomId: string): string {
        this.addClientToRoom(client, roomId);
        const roomState = this.rooms.get(roomId);
        const playerOne: PlayerDto = {
            id: this.connectedUsers.get(roomState.players[0].id).username,
            avatar: this.connectedUsers.get(roomState.players[0].id).avatar
        };
        
        const playerTwo: PlayerDto = roomState.players.length < this.roomSize ? null : {
            id: this.connectedUsers.get(roomState.players[1].id).username,
            avatar: this.connectedUsers.get(roomState.players[1].id).avatar
        };
        this.server.to(roomId).emit('matchmakingStats', {
            playerOne: playerOne,
            playerTwo: playerTwo,
        })
        if (roomState.players.length < this.roomSize || !roomState.settings.settingsSet) {
            client.emit('gameMatchmaking', {
                settingDone: false,
                firstPlayer: roomState.players.length === 1,
            });
        }
        else {
            this.startGame(
                roomId,
                this.playersData.get(roomState.players[0].id),
                this.playersData.get(roomState.players[1].id),
                roomState.settings
            );
        }

        return roomId;
    }

    public findAvailableRoom(): string | undefined {
        for (let [room, roomState] of this.rooms) {
            if (roomState.players.length < this.roomSize && !this.privateRooms.has(room)) {
                return room;
            }
        }
        return undefined;
    }

    public createRoom(client: Socket): string {
        const newRoomId = `${new Date().getTime()}`;
        this.rooms.set(newRoomId, new RoomState([client]));
        return newRoomId;
    }

    createPrivateRoom(client: Socket, userId: number) {
        const newRoomId = `${new Date().getTime()}`;
        const clientUser = this.connectedUsers.get(client.id).id;
        this.privateRooms.set(newRoomId, [clientUser, userId]);
        this.rooms.set(newRoomId, new RoomState([client]));
        this.assignClientToRoom(client, newRoomId);
        return newRoomId;
    }

    joinPrivateRoom(client: Socket, roomId: string) {
        const userId = this.connectedUsers.get(client.id).id;
        if (userId === this.privateRooms.get(roomId)[1]) {
            this.assignClientToRoom(client, roomId);
        } else {
        }
    }

    private addClientToRoom(client: Socket, roomId: string): void {
        const roomState = this.rooms.get(roomId);
        if (roomState) {
            client.join(roomId);
            if (!roomState.players.includes(client))
                roomState.players.push(client);
        }
    }

    public findMyLifePartner(roomId: string, otherClient: Socket) {
        const roomState = this.rooms.get(roomId);
        if (roomState) {
            let clients = this.rooms.get(roomId).players;
            for (const targetClient of clients) {
                if (targetClient.id != otherClient.id)
                    return targetClient;
            }
        }
        return null;
    }


    @Interval(1000 / 200)
    loop(): void {
        for (const [roomId, roomState] of this.rooms.entries()) {
            if (roomId &&
                roomState.state != RoomStatus.LAUNCHING ||
                (roomState.state === RoomStatus.INGAME && roomState.gameState.status !== GameStatus.FINISHED)) {
                this.server.to(roomId).emit('gameStateUpdate', { gameState: roomState.gameState });
                this.pongService.updateGameState(roomId);
                if (roomState.gameState && (roomState.gameState.ball.velocity.x >= 10 || roomState.gameState.ball.velocity.x <= -10)) {
                    this.gameService.updateSpeedDemon(this.connectedUsers.get(roomState.players[0].id).id, this.connectedUsers.get(roomState.players[1].id).id);
                }
            }
        }
    }

    public startGame(roomId: string, firstPlayer: pData, secondPlayer: pData, settings: GameSettings) {
        firstPlayer.gamesPlayed++;
        secondPlayer.gamesPlayed++;
        let roomState = this.rooms.get(roomId);
        this.server.to(roomId).emit('letsGO');
		this.eventEmitter.emit('user.state', firstPlayer.id, UserStatus.IN_GAME);
		this.eventEmitter.emit('user.state', secondPlayer.id, UserStatus.IN_GAME);
        roomState.state = RoomStatus.LAUNCHING;
        setTimeout(async () => {
            if (roomState.state === RoomStatus.INTERRUPT) {
                return;
            }
            this.rooms.get(roomId).state = RoomStatus.INGAME;
            const data: CreateMatchDto = this.formatCreateMatchData(roomState, this.connectedUsers.get(roomState.players[0].id), this.connectedUsers.get(roomState.players[1].id));
            const match = await this.gameService.createMatch(data);
            roomState.id = match.id;
            const allMatchs = await this.gameService.findAllGames();
            this.server.emit('matchs', allMatchs);
            this.pongService.startGame(roomId, settings, this.server);
        }, 5200);
    }

    public cleanRoom(roomId) {
        const roomState = this.rooms.get(roomId);
        if (!roomState) {
            console.error(`Room with ID ${roomId} does not exist.`);
            return;
        }
        const clients = roomState.players.concat(roomState.spectators);
        if (clients) {
            clients.forEach(client => {
                client.leave(roomId);
            });
        }
        this.cleanPrivateRoom(roomId);
        this.rooms.delete(roomId);
    }

    private cleanPrivateRoom(roomId) {
        if (this.privateRooms.has(roomId)) {
            const receiverId = this.privateRooms.get(roomId)[1];
            const receiverClient = this.getClientByUserId(receiverId);
            this.privateRooms.delete(roomId);
            this.server.to(receiverClient).emit("game-invite", '');
        }
    }

    private formatUpdateMatchData(roomState: RoomState, pOne: PlayerInfo, pTwo: PlayerInfo): UpdateMatchDto {
        const score: Score = roomState.gameState.score;
        const userOne: PlayerInfo = pOne;
        const userTwo: PlayerInfo = pTwo;
        const playerOne: PlayerData = {
            playerId: userOne.id,
            score: score.player1,
            role: "PLAYER_ONE"
        };
        const playerTwo: PlayerData = {
            playerId: userTwo.id,
            score: score.player2,
            role: "PLAYER_TWO"
        };
        return {
            players: [playerOne, playerTwo],
            status: "FINISHED",
        };
    }

    private formatCreateMatchData(roomState: RoomState, pOne: PlayerInfo, pTwo: PlayerInfo): CreateMatchDto {
        const userOne: PlayerInfo = pOne;
        const userTwo: PlayerInfo = pTwo;
        const playerOne: PlayerData = {
            playerId: userOne.id,
            score: 0,
            role: "PLAYER_ONE"
        };
        const playerTwo: PlayerData = {
            playerId: userTwo.id,
            score: 0,
            role: "PLAYER_TWO"
        };
        return {
            players: [playerOne, playerTwo],
            status: (roomState.state === RoomStatus.INTERRUPT ? "FINISHED" : "IN_GAME")
        };
    }

    findLoser(roomState: RoomState, winner: string) {
        const p1 = roomState.players[0].id;
        const p2 = roomState.players[1].id;
        if (p1 === winner)
            return p2;
        return p1;
    }

    async closingGame(roomId: string, winner: string, score_O: boolean) {
        const roomState = this.rooms.get(roomId);
        if (!roomState) return;

        this.server.to(roomId).emit('gameStateUpdate', { gameState: roomState.gameState });
        this.cleanRoom(roomId);

        const looser = this.findLoser(roomState, winner);
        const winnerUser = this.connectedUsers.get(winner);
        const looserUser = this.connectedUsers.get(looser);
        const playerOne = this.connectedUsers.get(roomState.players[0].id);
        const playerTwo = this.connectedUsers.get(roomState.players[1].id);
        await this.gameService.addMatchToStats(winnerUser.id, looserUser.id);
        await this.gameService.updateAchievement(winnerUser.id, looserUser.id, score_O);
		this.eventEmitter.emit('user.state', winnerUser.id, UserStatus.ONLINE);
		this.eventEmitter.emit('user.state', looserUser.id, UserStatus.ONLINE);
        let stats = await this.gameService.getPlayersStats(winnerUser.id, looserUser.id);

        if (!roomState.gameState || roomState.gameState.status === GameStatus.RUNNING) {
            this.server.to(winner).emit('gameFinishedShowStats', {
                winner: true,
                stats: stats,
                isAbandon: true,
                isSpectator: false
            })
        }
        else {
            roomState.players.forEach((player) => {
                this.server.to(player.id).emit('gameFinishedShowStats', {
                    winner: (player.id === winner),
                    stats: stats,
                    isAbandon: false,
                    isSpectator: false
                });
            });
        }

        if (roomState.spectators.length > 0) {
            roomState.spectators.forEach((spectator) => {
                this.server.to(spectator.id).emit('gameFinishedShowStats', {
                    winner: winnerUser,
                    stats: stats,
                    isAbandon: (roomState.gameState.status === GameStatus.RUNNING ? true : false),
                    isSpectator: true
                });
            })
        }
        if (!roomState.gameState) {
            roomState.state = RoomStatus.INTERRUPT;
            const data = this.formatCreateMatchData(roomState, playerOne, playerTwo);
            await this.gameService.createMatch(data);
        }
        else {
            const data = this.formatUpdateMatchData(roomState, playerOne, playerTwo);
            await this.gameService.updateMatch(roomState.id, data);
        }
        const allMatchs = await this.gameService.findAllGames();
        this.server.emit('matchs', allMatchs);
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