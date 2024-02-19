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
    players : Array<{
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
    public server : Server;
    public connectedUsers: Map<string, User>;

    constructor(
        private readonly pongService: PongService,
        private readonly gameService: GameService,
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) {}

    public setServer(server: Server, connectedUsers : Map<string, User>) {
        this.server = server;
        this.connectedUsers = connectedUsers;
    }

    public matchmakingExit(client: Socket, action : string, server) {
        let gameId : string, roomState : RoomState;
        for (const [room, roomstate] of this.rooms) {
            if (roomstate.players.includes(client)) {
                gameId = room;
                roomState = roomstate
                break;
            }
        }
        if (!roomState)
            return ;

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
            return ;
        
        roomState.players = roomState.players.filter(c => c.id !== client.id);
        client.leave(gameId);
        // console.log('Staying alone in the room '+ gameId);
        this.server.to(gameId).emit('matchmakingStats', {
            playerOne: { id: roomState.players[0].id.substring(0, 5) },
            playerTwo: null,
            roomId: gameId
        })
    }

    private playerOneMatchmakingExit(gameId, client) {
        const roomState = this.rooms.get(gameId);
        if (!roomState) return ;
        let roomPartner : Socket | null = this.findMyLifePartner(gameId, client);

        this.cleanRoom(gameId);
        console.log('Room ' + gameId + ' destroyed');

        if (roomPartner)
        {
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

    public assignClientToRoom(client: Socket) : string {
        const roomId = this.findAvailableRoom() || this.createRoom(client);
        this.addClientToRoom(client, roomId);
    
        const roomState = this.rooms.get(roomId);

        this.server.to(roomId).emit('matchmakingStats', {
            playerOne: { id: roomState.players[0].id.substring(0, 5) },
            playerTwo: (roomState.players.length < this.roomSize ? null : { id: roomState.players[1].id.substring(0, 5) }),
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

    public findMyLifePartner(roomId : string, otherClient : Socket) {
        console.log("roomId = " + roomId);
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
                (roomState.state === RoomStatus.INGAME && roomState.gameState.status !== GameStatus.FINISHED))
            {
                // console.log("y");
                this.server.to(roomId).emit('gameStateUpdate', { gameState: roomState.gameState });
                this.pongService.updateGameState(roomId);
            }
        }
    }

    public startGame(roomId : string, firstPlayer : pData, secondPlayer : pData, settings: GameSettings) {
        firstPlayer.gamesPlayed++;  
        secondPlayer.gamesPlayed++;
        let roomState = this.rooms.get(roomId);
        roomState.state = RoomStatus.LAUNCHING;
        this.server.to(roomId).emit('letsGO');
        setTimeout(async () => {
            this.rooms.get(roomId).state = RoomStatus.INGAME
            const data : CreateMatchDto = this.formatCreateMatchData(roomState);
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

    private formatUpdateMatchData(roomState : RoomState) : UpdateMatchDto {
        const score : Score = roomState.gameState.score;
        const userOne : User = this.connectedUsers.get(roomState.players[0].id);
        const userTwo : User = this.connectedUsers.get(roomState.players[1].id);
        const playerOne : PlayerData = {
            playerId: userOne.id,
            score: score.player1,
            role: "PLAYER_ONE"
        };
        const playerTwo : PlayerData = {
            playerId: userTwo.id,
            score: score.player2,
            role: "PLAYER_TWO"
        };
        return { 
            players: [playerOne, playerTwo],
            status: "FINISHED",
        };
    }

    private formatCreateMatchData(roomState : RoomState) : CreateMatchDto {
        const userOne : User = this.connectedUsers.get(roomState.players[0].id);
        const userTwo : User = this.connectedUsers.get(roomState.players[1].id);
        const playerOne : PlayerData = {
            playerId: userOne.id,
            score: 0,
            role: "PLAYER_ONE"
        };
        const playerTwo : PlayerData = {
            playerId: userTwo.id,
            score: 0,
            role: "PLAYER_TWO"
        };
        return { 
            players: [playerOne, playerTwo],
            status: "IN_GAME",
        };
    }

    async closingGame(roomId : string, winner : string) {
        const roomState = this.rooms.get(roomId);
        if (!roomState) return;

        // Send last update for classGame to stop and manage game field
        this.server.to(roomId).emit('gameStateUpdate', { gameState: roomState.gameState });
    
        // this.server.emit('historyAllMatch', games);

        // Update winner score, NEED TO CHANGE TO SEND IT TO DB LATER
        this.playersData.get(winner).wins++;

        // Get stats of 2 players, NEED TO CHANGE TO GET IT FROM DB LATER
        let stats = this.getPlayersStats(roomState.players);

        // Emit end of game, winner, stats and isAbandon to front to display the stats screen above game field
        // if gameStatus = RUNNING (so a player gave up) -> emit: only to winner front
        if (roomState.gameState.status === GameStatus.RUNNING) {
            this.server.to(winner).emit('gameFinishedShowStats', {
                winner: true,
                stats: stats,
                isAbandon: true,
                isSpectator : false
            })
        }
        // if gameStatus = FINISHED -> emit: to 2 players fronts
        else {
            roomState.players.forEach((player) => {
                this.server.to(player.id).emit('gameFinishedShowStats', {
                    winner: (player.id === winner), 
                    stats: stats,
                    isAbandon: false,
                    isSpectator : false
                });
            });
        }

        if (roomState.spectators.length > 0)
        {
            roomState.spectators.forEach((spectator) => {
                this.server.to(spectator.id).emit('gameFinishedShowStats', {
                    winner: winner, 
                    stats: stats,
                    isAbandon: (roomState.gameState.status === GameStatus.RUNNING ? true : false),
                    isSpectator : true
                });
            })
        }
        const data = this.formatUpdateMatchData(roomState);

        // clean room
        this.cleanRoom(roomId);

        const match = await this.gameService.updateMatch(roomState.id, data);
        console.log(`id: ${match.id} juste updated :`);
        console.log(`Date: ${match.createdAt}`);
        match.players.forEach(player => 
            console.log(`Player : ${player.player.username}, Score: ${player.score}, Role: ${player.role}`));
        const allMatchs = await this.gameService.findAllGames();
        this.server.emit('matchs', allMatchs);
}

    private getPlayersStats(players: Socket[]): { player1: any, player2: any } {
        const player1Stats = {
            id: players[0].id.substring(0, 5),
            wins: this.playersData.get(players[0].id).wins,
            gamesPlayed: this.playersData.get(players[0].id).gamesPlayed
        };
    
        const player2Stats = {
            id: players[1].id.substring(0, 5),
            wins: this.playersData.get(players[1].id).wins,
            gamesPlayed: this.playersData.get(players[1].id).gamesPlayed
        };
    
        return { player1: player1Stats, player2: player2Stats };
    }
}