import { useState } from "react";
import GradientSet from "./BallSettings/GradientSet";
import { useGame } from "../../components/GameProvider";

export function Paddle() {
    const game = useGame();
    const [paddleSizeNumber, setPaddleSizeNumber] = useState(game?.paddleHeight ? game?.paddleHeight / 100 : 3);
    const [paddleSize, setPaddleSize] = useState(paddleSizeNumber * 10);
    const [paddleSpeed, setPaddleSpeed] = useState(game?.paddleSpeed ? game?.paddleSpeed * 10 : 50);

    const increasePaddleSize = () => {
        if (paddleSize < 100) {
            const newSize = paddleSize + 10;
            const newSizeNumber = paddleSizeNumber + 1;
            setPaddleSize(newSize);
            setPaddleSizeNumber(newSizeNumber);
            game?.setPaddleHeight(newSizeNumber * 50);
        }
    }

    const decreasePaddleSize = () => {
        if (paddleSize > 10) {
            const newSize = paddleSize - 10;
            const newSizeNumber = paddleSizeNumber - 1;
            setPaddleSize(newSize);
            setPaddleSizeNumber(newSizeNumber);
            game?.setPaddleHeight(newSizeNumber * 50);
        }
    }

    const updatePaddleSpeed = (newSpeed) => {
        setPaddleSpeed(newSpeed);
        game?.setPaddleSpeed(newSpeed / 3);
    }

    return (
        <div className="paddle">
            <div>
                <div className="paddleSizeContainer">
                    <h2>Paddle Size</h2>
                    <div className="paddleSizeOutside">
                        <div className="paddleSizeInside" style={{ width: `${paddleSize}%` }}></div>
                    </div>
                </div>
                <div className="buttonSizePaddle">
                    <button className="lessbßutton" onClick={decreasePaddleSize}>-</button>
                    <strong>{paddleSizeNumber}</strong>
                    <button className="plusbutton" onClick={increasePaddleSize}>+</button>
                </div>
            </div>
            <GradientSet label="Movement Speed" setProgress={updatePaddleSpeed} progress={paddleSpeed} />
        </div>
    );
}
