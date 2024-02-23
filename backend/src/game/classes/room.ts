import { Socket } from 'socket.io'
import { GameState } from './pong';

export enum RoomStatus {
    MATCHMAKING = 0,
    INGAME = 1,
    LAUNCHING = 2,
    INTERRUPT = 3
}

export class pData {
    constructor(
        public id,
        public currNumber = 0,
        public gamesPlayed = 0,
        public wins = 0
    ) {}
}

export class GameSettings {
    constructor(
        public ballSpeed: number,
        public ballSize: number,
        public paddleSpeed: number,
        public paddleHeight: number,
        public increasedBallSpeed: number,
        public settingsSet: boolean = false
    ) {}
}

export class RoomState {
    constructor (
        public players: Socket[] = [],
        public spectators: Socket[] = [],
        public gameState: GameState | null = null,
        public settings: GameSettings = new GameSettings(0, 0, 0, 0, 0, false),
        public state: number = 0,
        public id: number = 0
    ) {}
}