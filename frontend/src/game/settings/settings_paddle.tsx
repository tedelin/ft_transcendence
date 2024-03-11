import { useState } from "react";
import GradientSet from "./BallSettings/GradientSet";

export function Paddle() {

    const [paddleSizeNumber, setPaddleSizeNumber] = useState(3);
    const [paddleSize, setPaddleSize] = useState(30);
    const [paddleSpeed, setPaddleSpeed] = useState(30);

    const increasePaddleSize = () =>{
        if (paddleSize < 100) {
            setPaddleSize(paddleSize + 10);
            setPaddleSizeNumber(paddleSizeNumber + 1);
        }
        console.log("paddleSizeNumber = ", paddleSizeNumber, " / paddleSize = ", paddleSize);
    }

    const decreasePaddleSize = () =>{
        if (paddleSize > 10) {
            setPaddleSize(paddleSize - 10);
            setPaddleSizeNumber(paddleSizeNumber - 1);
        }
        console.log("paddleSizeNumber = ", paddleSizeNumber, " / paddleSize = ", paddleSize);
    }

    return (
        <div className="paddle">
            <div>
                <div className="paddleSizeContainer">
                    <h2>Paddle Size </h2>
                    <div className="paddleSizeOutside">
                        <div className="paddleSizeInside" style={{ width: `${paddleSize}%` }}></div>
                    </div>
                </div>
                <div className="buttonSizePaddle">
                    <button className="plusbutton" onClick={increasePaddleSize}>+</button>
                    <strong>{paddleSizeNumber}</strong>
                    <button className="lessbutton" onClick={decreasePaddleSize}>-</button>
                </div>
            </div>
            <GradientSet label="Movement Speed" setProgress={setPaddleSpeed} progress={paddleSpeed} /> 
        </div>
    )
}