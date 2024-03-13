import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { Socket, Server } from 'socket.io';
import { RoomService } from './room.service';
import { GameState, Ball, KeyState, GameStatus } from '../classes/pong';
import { GameSettings } from '../classes/room';
import { GameService } from "./game.service";

@Injectable()
export class PongService {
    constructor(
        @Inject(forwardRef(() => RoomService)) private readonly roomService: RoomService,
        private readonly gameService: GameService,
    ) { }

    private initGameState(settings: GameSettings): GameState {
        let paddleWidth = 20;
        let canvasHeight = 800;
        let canvasWidth = 1200;

        const paddles = {
            height: settings.paddleHeight,
            width: paddleWidth,
            leftPos: {
                x: 15,
                y: canvasHeight / 2 - settings.paddleHeight / 2
            },
            rightPos: {
                x: canvasWidth - paddleWidth - 15,
                y: canvasHeight / 2 - settings.paddleHeight / 2
            },
            speed: settings.paddleSpeed
        };
        const ball: Ball = {
            radius: settings.ballSize,
            pos: {
                x: canvasWidth / 2,
                y: canvasHeight / 2
            },
            velocity: {
                x: settings.ballSpeed,
                y: settings.ballSpeed
            },
            increaseBallSpeed: settings.increasedBallSpeed
        };
        return (new GameState(paddles, ball));
    }

    public startGame(roomId: string, settings: GameSettings, server: Server) {
        const gameState: GameState = this.initGameState(settings);
        this.roomService.rooms.get(roomId).gameState = gameState;
        server.to(roomId).emit('gameLaunch', { gameState: gameState, winner: false });
    }

    private calculateWinner(gameState: GameState) {
        if (gameState.score.player1 === 11 || gameState.score.player2 === 11) {
            let winner = gameState.score.player1 === 11 ? 1 : 2;
            return (winner);
        }
        return 0;
    }

    async updateGameState(roomId: string) {
        let winner = 0;
        let score_O = false;
        const roomState = this.roomService.rooms.get(roomId);
        if (!roomState) return;

        const gameState = roomState.gameState;
        if (!gameState) return;

        winner = this.calculateWinner(gameState);
        if (winner) {
            await new Promise(resolve => setTimeout(resolve, 200));
            if (gameState.score.player1 === 0 || gameState.score.player2 === 0)
                score_O = true;
            gameState.status = GameStatus.FINISHED;
            this.roomService.closingGame(roomId, roomState.players[winner - 1].id, score_O);
            return;
        }
        gameState.point(roomState.settings.paddleHeight, roomState.settings.ballSpeed, roomState.settings.paddleSpeed)
        gameState.collisions();
        gameState.pressKeys();
        gameState.speedChange();

    }

    public updatePaddlePosition(playerId: string, roomId: string, key, action) {
        const roomState = this.roomService.rooms.get(roomId);
        if (!roomState) return;
        const gameState = roomState.gameState;
        if (!gameState) return;

        const paddleSide = (roomState.players[0].id === playerId ? 'left' : 'right');

        if (action === 'released')
            gameState.keys[paddleSide][key] = KeyState.RELEASE;
        else
            gameState.keys[paddleSide][key] = KeyState.PRESS;
    }
}