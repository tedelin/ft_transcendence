export enum KeyState {
    RELEASE = 0,
    PRESS = 1
}

export enum GameStatus {
    RUNNING = 0,
    FINISHED = 1,
}

export interface PaddleKey {
    [key: string]: KeyState;
}

export interface Keys {
    left: PaddleKey;
    right: PaddleKey;
}

export interface Pos {
    x: number;
    y: number;
}

export interface Paddles {
    height: number,
    width: number,
    leftPos: Pos,
    rightPos: Pos,
    speed: number
}

export interface Ball {
    radius: number,
    pos: Pos,
    velocity: Pos,
    increaseBallSpeed: number
}

export interface Score {
    player1: number,
    player2: number
}

export class GameState {
    constructor(
        public paddles: Paddles,
        public ball: Ball,
        public score: Score = { player1: 0, player2: 0 },
        public status: GameStatus = GameStatus.RUNNING,
        public keys: Keys = {
            left: {
                'ArrowUp': KeyState.RELEASE,
                'ArrowDown': KeyState.RELEASE
            },
            right: {
                'ArrowUp': KeyState.RELEASE,
                'ArrowDown': KeyState.RELEASE
            }
        },
        private canvasHeight = 600,
        private canvasWidth = 800,
    ) { }

    private resetSpeed(paddleHeight, ballSpeed, paddleSpeed, point_win) {
        this.paddles.height = paddleHeight;
        let i = Math.floor(Math.random() * (2 * ballSpeed + 1)) - ballSpeed;
        while (i === 0) i = Math.floor(Math.random() * (2 * ballSpeed + 1)) - ballSpeed;
        this.ball.velocity = { x: ballSpeed * point_win, y: i };
        this.paddles.speed = paddleSpeed;
        this.paddles.leftPos = { x: this.paddles.width / 2, y: this.canvasHeight / 2 };
        this.paddles.rightPos = { x: this.canvasWidth - this.paddles.width / 2, y: this.canvasHeight / 2 };
    }

    public point(pHeight, bSpeed, pSpeed): number {
        if (this.ball.pos.x + this.ball.radius + this.ball.velocity.x > this.canvasWidth) {
            this.ball.pos = { x: this.canvasWidth / 2, y: this.canvasHeight / 2 };
            this.score.player1++;
            this.resetSpeed(pHeight, bSpeed, pSpeed, 1);
            return 1;
        }
        else if (this.ball.pos.x - this.ball.radius + this.ball.velocity.x < 0) {
            this.ball.pos = { x: this.canvasWidth / 2, y: this.canvasHeight / 2 };
            this.score.player2++;
            this.resetSpeed(pHeight, bSpeed, pSpeed, -1);
            return 1;
        }

        return 0;
    }

    public collisions() {
		// walls
		if (this.ball.pos.y + this.ball.radius >= this.canvasHeight || this.ball.pos.y - this.ball.radius <= 0) {
			this.ball.velocity = { x: this.ball.velocity.x, y: -this.ball.velocity.y };
		}
	
		// paddles
		if (
			(this.ball.pos.x - this.ball.radius < this.paddles.width && this.ball.pos.y > this.paddles.leftPos.y - this.paddles.height / 2 && this.ball.pos.y < this.paddles.leftPos.y + this.paddles.height / 2) ||
			(this.ball.pos.x + this.ball.radius > this.canvasWidth - this.paddles.width && this.ball.pos.y > this.paddles.rightPos.y - this.paddles.height / 2 && this.ball.pos.y < this.paddles.rightPos.y + this.paddles.height / 2)
		) {
			this.ball.velocity = { x: -this.ball.velocity.x, y: this.ball.velocity.y };
	
			// Adjust ball position to prevent it from getting stuck inside the paddle
			if (this.ball.pos.x > this.canvasWidth / 2) {
				this.ball.pos.x -= 10;
			} else {
				this.ball.pos.x += 10;
			}
	
			// Adjust ball velocity based on key presses
			if (this.keys['left']['ArrowUp'] === KeyState.PRESS && this.ball.pos.x < this.canvasWidth / 2) {
				this.ball.velocity.y += 3;
			}
			if (this.keys['left']['ArrowDown'] === KeyState.PRESS && this.ball.pos.x < this.canvasWidth / 2) {
				this.ball.velocity.y -= 3;
			}
			if (this.keys['right']['ArrowUp'] === KeyState.PRESS && this.ball.pos.x > this.canvasWidth / 2) {
				this.ball.velocity.y += 3;
			}
			if (this.keys['right']['ArrowDown'] === KeyState.PRESS && this.ball.pos.x > this.canvasWidth / 2) {
				this.ball.velocity.y -= 3;
			}
		}
	}
	

    public pressKeys() {
        if (this.keys['left']['ArrowUp'] === KeyState.PRESS) this.paddles.leftPos.y = Math.max(this.paddles.leftPos.y - this.paddles.speed, this.paddles.height / 2);
        if (this.keys['left']['ArrowDown'] === KeyState.PRESS) this.paddles.leftPos.y = Math.min(this.paddles.leftPos.y + this.paddles.speed, this.canvasHeight - this.paddles.height / 2);
        if (this.keys['right']['ArrowUp'] === KeyState.PRESS) this.paddles.rightPos.y = Math.max(this.paddles.rightPos.y - this.paddles.speed, this.paddles.height / 2);
        if (this.keys['right']['ArrowDown'] === KeyState.PRESS) this.paddles.rightPos.y = Math.min(this.paddles.rightPos.y + this.paddles.speed, this.canvasHeight - this.paddles.height / 2);
    }

    public speedChange() {
        const save_balle_velocity_x = this.ball.velocity.x;
        this.ball.pos = {
            x: this.ball.pos.x + this.ball.velocity.x,
            y: this.ball.pos.y + this.ball.velocity.y,
        };
        this.paddles.height > 100 ? this.paddles.height -= 0.01 : 0;
        this.ball.velocity.x += (this.ball.velocity.x < 10 && this.ball.velocity.x > 0) ? this.ball.increaseBallSpeed : 0;
        this.ball.velocity.x -= (this.ball.velocity.x > -10 && this.ball.velocity.x < 0) ? this.ball.increaseBallSpeed : 0;
        this.ball.velocity.y += (this.ball.velocity.y < 10 && this.ball.velocity.y > 0) ? this.ball.increaseBallSpeed : 0;
        this.ball.velocity.y -= (this.ball.velocity.y > -10 && this.ball.velocity.y < 0) ? this.ball.increaseBallSpeed : 0;
        if (this.paddles.speed < 20)
            this.paddles.speed += 0.001;
    }
}