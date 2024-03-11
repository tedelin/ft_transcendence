import GradientSet from "./GradientSet"
import BallSize from "./BallSize"
import { useState } from 'react';


const BallSettings = () => {
	const [progressSpeed, setProgressSpeed] = useState(70);
	const [progressAcceleration, setProgressAcceleration] = useState(100);
	const [choice, setChoice] = useState("small");



	return (
		<div className="BallSettings">
			<GradientSet label="Ball Speed" progress={progressSpeed} setProgress={setProgressSpeed}/>
			<GradientSet label="Ball Acceleration" progress={progressAcceleration} setProgress={setProgressAcceleration}/>
			<BallSize setChoice={setChoice}/>
		</div>
	)
}

export default BallSettings