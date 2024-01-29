import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { Interval } from '@nestjs/schedule';
import { Socket, Server } from 'socket.io';
import { pData, GameSettings, RoomState, RoomStatus } from '../classes/room'
import { GameStatus } from "../classes/pong";
import { PongService } from "./pong.service";

@Injectable()
export class RoomService {

    public rooms: Map<string, RoomState> = new Map();
    public playersData: Map<string, pData> = new Map();
    public roomSize = 2;
    public server : Server;

    constructor(private readonly pongService: PongService) {}
s
    public setServer(server: Server) {
        this.server = server;
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
            playerTwo: null
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
            console.log(`Room ID: ${roomId}, Number of Clients: ${roomState.players.length}`);
        });
    }


    public assignClientToRoom(client: Socket) : string {
        const roomId = this.findAvailableRoom() || this.createRoom(client);
        this.addClientToRoom(client, roomId);
    
        const roomState = this.rooms.get(roomId);

        this.server.to(roomId).emit('matchmakingStats', {
            playerOne: { id: roomState.players[0].id.substring(0, 5) },
            playerTwo: (roomState.players.length < this.roomSize ? null : { id: roomState.players[1].id.substring(0, 5) })
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
        const newRoomId = `game_${new Date().getTime()}`;
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
        let clients = this.rooms.get(roomId).players;
        for (const targetClient of clients) {
            if (targetClient.id != otherClient.id)
                return targetClient;
        }
        return null;
    }


    @Interval(1000 / 200)
    loop(): void {
        for (const [roomId, roomState] of this.rooms.entries()) {
            if (roomId && roomState.state === RoomStatus.INGAME)// && roomState.gameState.status !== GameStatus.FINISHED)
            {
                this.server.to(roomId).emit('gameStateUpdate', { gameState: roomState.gameState });
                this.pongService.updateGameState(roomId);
            }
        }
    }

    // TO HANDLE
    public startGame(roomId : string, firstPlayer : pData, secondPlayer : pData, settings: GameSettings) {
        firstPlayer.gamesPlayed++;  
        secondPlayer.gamesPlayed++;
        this.rooms.get(roomId).state = RoomStatus.INGAME;
        this.server.to(roomId).emit('letsGO');
        setTimeout(() => {
            this.pongService.startGame(roomId, settings, this.server);
        }, 5200);
    }

    public cleanRoom(roomId) {
        const roomState = this.rooms.get(roomId);
        if (!roomState) {
            console.error(`Room with ID ${roomId} does not exist.`);
            return;
        }
        const clients = roomState.players;
        if (clients) {
            clients.forEach(client => {
                client.leave(roomId);
            });
        }
        this.rooms.delete(roomId);
    }

    public closingGame(roomId : string, winner : string) {
        const roomState = this.rooms.get(roomId);
        if (!roomState) return;

        // Send last update for classGame to stop and manage game field
        this.server.to(roomId).emit('gameStateUpdate', { gameState: roomState.gameState });

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
                isAbandon: true
            })
        }
        // if gameStatus = FINISHED -> emit: to 2 players fronts
        else {
            roomState.players.forEach((player, index) => {
                this.server.to(player.id).emit('gameFinishedShowStats', {
                    winner: (player.id === winner), 
                    stats: stats,
                    isAbandon: false
                });
            });
        }

        // clean room
        this.cleanRoom(roomId);
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