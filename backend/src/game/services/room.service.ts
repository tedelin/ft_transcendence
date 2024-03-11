import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { Interval } from '@nestjs/schedule';
import { Socket, Server } from 'socket.io';
import { pData, GameSettings, RoomState, RoomStatus } from '../classes/room'
import { GameState, GameStatus, Score } from "../classes/pong";
import { PongService } from "./pong.service";
import { GameService } from "./game.service";
import { CreateMatchDto, PlayerData } from "../dto/create-match.dto";
import { AuthService } from "src/auth/auth.service";
import { UserService } from "src/user/user.service";
import { User } from "@prisma/client";
import { UpdateMatchDto } from "../dto/update-match.dto";

interface Matchs {
    id: number,
    date: any,
    players: Array<{
        username: string,
        score: number,
        role: string
    }>
}

@Injectable()
export class RoomService {

    public rooms: Map<string, RoomState> = new Map();
    public playersData: Map<string, pData> = new Map();
    public roomSize = 2;
    public server: Server;
    public connectedUsers: Map<string, User>;

    constructor(
        private readonly pongService: PongService,
        private readonly gameService: GameService,
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) { }

    public setServer(server: Server, connectedUsers: Map<string, User>) {
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
        let roomPartner: Socket | null = this.findMyLifePartner(gameId, client);

        this.cleanRoom(gameId);
        console.log('Room ' + gameId + ' destroyed');

        if (roomPartner) {
            console.log(roomPartner.id + ' reattributed to new room');
            this.assignClientToRoom(roomPartner);
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
            console.log(`Room ID: ${roomId}, Players: [${playerUsernames}], Spectators: [${spectatorUsernames}]`);
        });
    }

    public assignClientToRoom(client: Socket): string {
        const roomId = this.findAvailableRoom() || this.createRoom(client);
        this.addClientToRoom(client, roomId);

        const roomState = this.rooms.get(roomId);

        this.server.to(roomId).emit('matchmakingStats', {
            playerOne: { id: this.connectedUsers.get(roomState.players[0].id).username, avatar: this.connectedUsers.get(roomState.players[0].id).avatar},
            playerTwo: (roomState.players.length < this.roomSize ? null : { id: this.connectedUsers.get(client.id).username, avatar: this.connectedUsers.get(client.id).avatar }),
            roomId: roomId
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

    private findAvailableRoom(): string | undefined {
        for (let [room, roomState] of this.rooms) {
            if (roomState.players.length < this.roomSize) {
                return room;
            }
        }
        return undefined;
    }

    private createRoom(client: Socket): string {
        const newRoomId = `${new Date().getTime()}`;
        this.rooms.set(newRoomId, new RoomState([client]));
        return newRoomId;
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
        roomState.state = RoomStatus.LAUNCHING;
        setTimeout(async () => {
            if (roomState.state === RoomStatus.INTERRUPT) {
                return;
            }
            this.rooms.get(roomId).state = RoomStatus.INGAME;
            const data: CreateMatchDto = this.formatCreateMatchData(roomState, this.connectedUsers.get(roomState.players[0].id), this.connectedUsers.get(roomState.players[1].id));
            const match = await this.gameService.createMatch(data);
            roomState.id = match.id;
            console.log(`${match.id} just created`);
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
        this.rooms.delete(roomId);
    }

    private formatUpdateMatchData(roomState: RoomState, pOne: User, pTwo: User): UpdateMatchDto {
        const score: Score = roomState.gameState.score;
        const userOne: User = pOne;
        const userTwo: User = pTwo;
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

    private formatCreateMatchData(roomState: RoomState, pOne: User, pTwo: User): CreateMatchDto {
        const userOne: User = pOne;
        const userTwo: User = pTwo;
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
                    winner: winnerUser.username,
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
}