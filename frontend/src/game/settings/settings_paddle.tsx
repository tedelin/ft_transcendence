import { useState } from "react";

export function Paddle() {

    const [paddleSizeNumber, setPaddleSizeNumber] = useState(3);
    const [paddleSize, setPaddleSize] = useState(30);

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
            <div className="paddleSizeContainer">
                <p>Paddle Size </p>
                <div className="paddleSizeOutside">
                    <div className="paddleSizeInside" style={{ width: `${paddleSize}%` }}></div>
                </div>
            </div>
            <div className="buttonSizePaddle">
                <button className="plusbutton" onClick={increasePaddleSize}>+</button>
                <p>{paddleSizeNumber}</p>
                <button className="lessbutton" onClick={decreasePaddleSize}>-</button>
            </div>
        </div>
    )
}