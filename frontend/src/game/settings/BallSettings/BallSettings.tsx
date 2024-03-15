import GradientSet from "./GradientSet";
import BallSize from "./BallSize";
import { useState } from 'react';
import { useGame } from "../../../components/GameProvider";

const BallSettings = () => {
    const game = useGame();
    const [progressSpeed, setProgressSpeed] = useState(50);
    const [progressAcceleration, setProgressAcceleration] = useState(game?.increasedBallSpeed ? game.increasedBallSpeed * 10000 : 0);
    const determineChoice = (ballSize) => {
        if (ballSize < 10) return "smallSizeBall";
        else if (ballSize < 20) return "mediumSizeBall";
        else return "largeSizeBall";
    };

    const [choice, setChoice] = useState(determineChoice(game?.ballSize));

    const updateBallSpeed = (newSpeed) => {
        game?.setBallSpeed(newSpeed / 1000); 
        setProgressSpeed(newSpeed);
    };
    const updateIncreasedBallSpeed = (newAcceleration) => {
        game?.setIncreasedBallSpeed(newAcceleration / 10000); 
        setProgressAcceleration(newAcceleration);
    };
    const updateBallSize = (newSize) => {
        game?.setBallSize(newSize);
        setChoice(determineChoice(newSize));
    };

    return (
        <div className="BallSettings">
            <GradientSet label="Ball Speed" progress={progressSpeed} setProgress={updateBallSpeed} />
            <GradientSet label="Ball Acceleration" progress={progressAcceleration} setProgress={updateIncreasedBallSpeed} />
            <BallSize choice={choice} setChoice={(size) => updateBallSize(size)} />
        </div>
    );
}

export default BallSettings;
