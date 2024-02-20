import React, { useEffect } from 'react';

// const RUNNING = 0;
const ENDED = 1;
// const ballTrail = [];

interface Pos {
    x: number;
    y: number;
}

interface Paddles {
    height: number;
    width: number;
    leftPos: Pos;
    rightPos: Pos;
    speed: number;
}

interface Ball {
    radius: number;
    pos: Pos;
    velocity: Pos;
    increaseBallSpeed: number;
}

interface Score {
    player1: number;
    player2: number;
}

interface GameState {
    paddles: Paddles;
    ball: Ball;
    score: Score;
    status: number;
}


export class ClassGame {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    socket: any;
    canvasWidth: number;
    canvasHeight: number;
    localState: GameState | null ;
    win: boolean;

    constructor(canvasRef : React.RefObject<HTMLCanvasElement>, gameState, socket : any) {
        this.canvasRef = canvasRef;
        this.canvasHeight = 800;
        this.canvasWidth = 1200;
        this.socket = socket;
        this.updateCanvas = this.updateCanvas.bind(this);
        this.localState = this.copyState(gameState);
        this.win = false;
    }

    copyState(gameState) : GameState | null {
        if (!gameState)
            return null;
        return {
            paddles: {
                ...gameState.paddles,
                leftPos: { ...gameState.paddles.leftPos },
                rightPos: { ...gameState.paddles.rightPos }
            },
            ball: {
                ...gameState.ball,
                pos: { ...gameState.ball.pos },
                velocity: { ...gameState.ball.velocity }
            },
            score: { ...gameState.score },
            status: gameState.status
        };
    }

    draw(context) {
        context.fillStyle = 'grey';
        context.fillRect(this.canvasWidth / 2 - 2.5, 0, 5, this.canvasHeight);
        context.strokeStyle = 'grey';
        context.lineWidth = 2;
        context.beginPath();
        context.arc(this.canvasWidth / 2, this.canvasHeight / 2, 150, 0, 2 * Math.PI);
        context.stroke();

        // paddles
        context.fillStyle = 'white';
        context.fillRect(15, this.localState.paddles.leftPos.y, this.localState.paddles.width, this.localState.paddles.height);
        context.fillRect(this.canvasWidth - this.localState.paddles.width - 15, this.localState.paddles.rightPos.y, this.localState.paddles.width, this.localState.paddles.height);

        // ball
        if (this.localState.status !== ENDED) {
            context.beginPath();
            context.arc(this.localState.ball.pos.x, this.localState.ball.pos.y, this.localState.ball.radius, 0, 2 * Math.PI);
            context.fillStyle = 'white';
            context.fill();
        }

        // score
        context.font = '100px Arial';
        context.fillStyle = 'white';
        context.fillText(`${this.localState.score.player1}`, this.canvasWidth / 4, this.canvasHeight / 6);
        context.fillText(`${this.localState.score.player2}`, this.canvasWidth - this.canvasWidth / 4, this.canvasHeight / 6);
    }

    updateCanvas() {
        const canvas = this.canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');

        context.fillStyle = "rgba(0, 0, 0, 0.15)";
        context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        // context!.clearRect(0, 0, canvas.width, canvas.height);
        this.draw(context);

        if (this.localState.status === ENDED) {
            context.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Fond semi-transparent
            context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        else
            requestAnimationFrame(this.updateCanvas);
    }

    startGame() {
        this.socket.on('gameStateUpdate', (data) => {
            this.localState = this.copyState(data.gameState);
        });

        requestAnimationFrame(this.updateCanvas);
    }
}