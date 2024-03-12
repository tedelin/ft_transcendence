import logoImage from './logo.png';

const ENDED = 1;

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
    localState: GameState | null;
    win: boolean;
    logoImage : HTMLImageElement = new Image();

    constructor(canvasRef: React.RefObject<HTMLCanvasElement>, gameState, socket, dimensions: {width: number, height: number}) {
        this.canvasRef = canvasRef;
        this.canvasHeight = dimensions.height;
        this.canvasWidth = dimensions.width;
        this.socket = socket;
        this.updateCanvas = this.updateCanvas.bind(this);
        this.localState = this.copyState(gameState);
        this.win = false;
        this.logoImage.onload = () => {
            this.updateCanvas();
        };
        this.logoImage.onerror = (error) => {
            console.error("Erreur lors du chargement de l'image :", error);
        };
        this.logoImage.src = logoImage;
    }

    updateDimensions(width: number, height: number) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.updateCanvas();
    }

    copyState(gameState): GameState | null {
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

    drawRoundedRect(context, x, y, width, height, radius) {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
        context.fill();
    }

    draw(context) {
        // paddles
        context.fillStyle = 'black';
        this.drawRoundedRect(context, 15, this.localState.paddles.leftPos.y, this.localState.paddles.width, this.localState.paddles.height, 10);
        this.drawRoundedRect(context, this.canvasWidth - this.localState.paddles.width - 15, this.localState.paddles.rightPos.y, this.localState.paddles.width, this.localState.paddles.height, 10); // Utilisez le même rayon ou un différent selon vos besoins

        //line
        context.fillStyle = 'black';
        context.fillRect(this.canvasWidth / 2, 0, 2, this.canvasHeight);
        
        // center circle
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.beginPath();
        context.arc(this.canvasWidth / 2, this.canvasHeight / 2, 150, 0, 2 * Math.PI);
        context.stroke();
        
        // center logo
        if (this.logoImage.complete) {
            const logoX = this.canvasWidth / 2 - 48 / 2;
            const logoY = this.canvasHeight / 2 - 48 / 2;
            context.fillStyle = 'white';
            context.beginPath();
            context.arc(logoX + 48 / 2, logoY + 48 / 2, 48 / 2, 0, Math.PI * 2);
            context.fill();
            context.drawImage(this.logoImage, logoX + 1, logoY, 48, 48);
        }

        // ball
        context.beginPath();
        context.fillStyle = 'black';
        context.arc(this.localState.ball.pos.x, this.localState.ball.pos.y, this.localState.ball.radius, 0, 2 * Math.PI);
        context.fill();
    }


    updateCanvas() {
        const canvas = this.canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');

        // canvas.width = this.canvasWidth; 
        // canvas.height = this.canvasHeight; 

        context.fillStyle = "rgba(255, 255, 255, 0.20)";
        context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        // context!.clearRect(0, 0, canvas.width, canvas.height);
        this.draw(context);

        if (this.localState.status != ENDED)
            requestAnimationFrame(this.updateCanvas);
    }

    startGame() {
        this.socket.on('gameStateUpdate', (data) => {
            this.localState = this.copyState(data.gameState);
        });

        requestAnimationFrame(this.updateCanvas);
    }
}