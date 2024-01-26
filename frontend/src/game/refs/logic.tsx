import React, { useEffect } from 'react';
import socket from '../socket';

const RELEASE = 0;
const PRESS = 1;

interface KeyState {
    [key: string]: number;
}

export class classGame {

    canvasRef: React.RefObject<HTMLCanvasElement>;
    socket: any;
    paddleHeight: number;
    paddleWidth: number;
    canvasWidth: number;
    canvasHeight: number;
    ballRadius: number;
    leftPaddlePosition: number;
    rightPaddlePosition: number;
    paddleSpeed: number;
    ballPositionRef: React.RefObject<{ x: number, y: number }>;
    ballSpeedRef: React.RefObject<{ x: number, y: number }>;
    scorePlayer1: number;
    scorePlayer2: number;
    keys: {
        left: KeyState;
        right: KeyState;
    }
    gameOver: boolean;
    winner : number;
    increaseBallSpeed: number;
    resetSpeed: () => void;
    isFirstPlayer: boolean;

    constructor(ballSpeed: number, paddleHeight: number, paddleSpeed: number, increasedBallSpeed: number, ballSize : number, firstPlayer: boolean) {
        this.canvasRef = React.createRef();
        this.socket = socket;
        this.updateCanvas = this.updateCanvas.bind(this);
        this.paddleHeight = paddleHeight;
        this.paddleWidth = 20;
        // this.canvasWidth = window.innerWidth;
        // this.canvasHeight = window.innerHeight;
        this.canvasHeight = 800;
        this.canvasWidth = 1200;
        this.ballRadius = ballSize;
        this.leftPaddlePosition = this.canvasHeight / 2 - this.paddleHeight / 2;
        this.rightPaddlePosition = this.canvasHeight / 2 - this.paddleHeight / 2;
        this.paddleSpeed = paddleSpeed;
        this.ballPositionRef = React.createRef();
        this.ballPositionRef.current = { x: this.canvasWidth / 2, y: this.canvasHeight / 2 };
        this.ballSpeedRef = React.createRef();
        this.ballSpeedRef.current = { x: ballSpeed, y: ballSpeed };
        this.scorePlayer1 = 0;
        this.scorePlayer2 = 0;
        this.keys = {
            left: {
                'w': RELEASE,
                's': RELEASE
            },
            right: {
                'w': RELEASE,
                's': RELEASE
            }
        };
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.gameOver = false;
        this.winner = 0;
        this.increaseBallSpeed = increasedBallSpeed;
        this.resetSpeed = () => {
            this.paddleHeight = paddleHeight;
            this.ballSpeedRef.current = { x: ballSpeed, y: ballSpeed };
            this.paddleSpeed = paddleSpeed;
        }
        this.isFirstPlayer = firstPlayer;
    }

    handleKeyDown = (event) => {
        if (event.key in this.keys.left || event.key in this.keys.right) {
            this.socket.emit('keydown', { key: event.key });
        }
    };

    handleKeyUp(event) {
        if (event.key in this.keys.left || event.key in this.keys.right) {
            this.socket.emit('keyup', { key: event.key });
        }
    };

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
        context.fillRect(15, this.leftPaddlePosition, this.paddleWidth, this.paddleHeight);
        context.fillRect(this.canvasWidth - this.paddleWidth - 15, this.rightPaddlePosition, this.paddleWidth, this.paddleHeight);

        // ball
        context.beginPath();
        context.arc(this.ballPositionRef.current.x, this.ballPositionRef.current.y, this.ballRadius, 0, 2 * Math.PI);
        context.fillStyle = 'white';
        context.fill();

        // score
        context.font = '100px Arial';
        context.fillStyle = 'white';
        context.fillText(`${this.scorePlayer1}`, this.canvasWidth / 4, this.canvasHeight / 6);
        context.fillText(`${this.scorePlayer2}`, this.canvasWidth - this.canvasWidth / 4, this.canvasHeight / 6);
    }

    point() {
        if (this.ballPositionRef.current.x + this.ballRadius + this.ballSpeedRef.current.x > this.canvasWidth) {
            this.ballPositionRef.current = { x: this.canvasWidth / 2, y: this.canvasHeight / 2 };
            this.scorePlayer1++;
            this.resetSpeed();
        }
        else if (this.ballPositionRef.current.x - this.ballRadius + this.ballSpeedRef.current.x < 0) {
            this.ballPositionRef.current = { x: this.canvasWidth / 2, y: this.canvasHeight / 2 };
            this.scorePlayer2++;
            this.resetSpeed();
        }

        if (this.scorePlayer1 === 3 || this.scorePlayer2 === 3) {
            this.gameOver = true;
            this.winner = this.scorePlayer1 === 3 ? 1 : 2;
            console.log("winner is player " + this.winner);
            console.log("curr player is " + this.isFirstPlayer);
            if (this.isFirstPlayer)
            {
                console.log("classGame endgame");
                socket.emit('endGame', { winner: this.winner });
            }
        }
    }


    collisions() {
        // walls
        if (this.ballPositionRef.current.y + this.ballRadius + this.ballSpeedRef.current.y > this.canvasHeight || this.ballPositionRef.current.y - this.ballRadius + this.ballSpeedRef.current.y < 0) {
            this.ballSpeedRef.current = { x: this.ballSpeedRef.current.x, y: -this.ballSpeedRef.current.y };
        }

        // paddles
        if (
            (this.ballPositionRef.current.x - this.ballRadius < this.paddleWidth && this.ballPositionRef.current.y > this.leftPaddlePosition && this.ballPositionRef.current.y < this.leftPaddlePosition + this.paddleHeight) ||
            (this.ballPositionRef.current.x + this.ballRadius > this.canvasWidth - this.paddleWidth && this.ballPositionRef.current.y > this.rightPaddlePosition && this.ballPositionRef.current.y < this.rightPaddlePosition + this.paddleHeight)
        ) {
            this.ballSpeedRef.current = { x: -this.ballSpeedRef.current.x, y: this.ballSpeedRef.current.y };
            if (this.ballPositionRef.current.x > this.canvasWidth / 2)
                this.ballPositionRef.current.x -= 10;
            else
                this.ballPositionRef.current.x += 10;
        }
    }

    pressKeys() {
        if (this.keys['left']['w'] === PRESS) this.leftPaddlePosition = Math.max(this.leftPaddlePosition - this.paddleSpeed, 0);
        if (this.keys['left']['s'] === PRESS) this.leftPaddlePosition = Math.min(this.leftPaddlePosition + this.paddleSpeed, this.canvasHeight - this.paddleHeight);
        if (this.keys['right']['w'] === PRESS) this.rightPaddlePosition = Math.max(this.rightPaddlePosition - this.paddleSpeed, 0);
        if (this.keys['right']['s'] === PRESS) this.rightPaddlePosition = Math.min(this.rightPaddlePosition + this.paddleSpeed, this.canvasHeight - this.paddleHeight);
    }

    speedChange() {
        this.ballPositionRef.current = {
            x: this.ballPositionRef.current.x + this.ballSpeedRef.current.x,
            y: this.ballPositionRef.current.y + this.ballSpeedRef.current.y,
        };
        this.paddleHeight > 100 ? this.paddleHeight -= 0.01 : 0;
        this.ballSpeedRef.current.x += (this.ballSpeedRef.current.x < 10 && this.ballSpeedRef.current.x > 0) ? this.increaseBallSpeed : 0;
        this.ballSpeedRef.current.x -= (this.ballSpeedRef.current.x > -10 && this.ballSpeedRef.current.x < 0) ? this.increaseBallSpeed : 0;
        this.ballSpeedRef.current.y += (this.ballSpeedRef.current.y < 10 && this.ballSpeedRef.current.y > 0) ? this.increaseBallSpeed : 0;
        this.ballSpeedRef.current.y -= (this.ballSpeedRef.current.y > -10 && this.ballSpeedRef.current.y < 0) ? this.increaseBallSpeed : 0;

        if (this.paddleSpeed < 20)
            this.paddleSpeed += 0.001;
    }

    updateCanvas() {
        const canvas = this.canvasRef.current;
        if (!canvas)
            return;
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.draw(context);
        this.point();
        this.collisions();
        this.pressKeys();
        this.speedChange();

        if (!this.gameOver)
            requestAnimationFrame(this.updateCanvas);
    };

    initGame() {
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);
        this.socket.on('updatePaddle', (data) => {
            if (data.action === 'down')
                this.keys[data.player][data.key] = PRESS;
            else
                this.keys[data.player][data.key] = RELEASE;
        });
        
        requestAnimationFrame(this.updateCanvas);
    };

    startGame() {
        this.initGame();
    };
}
