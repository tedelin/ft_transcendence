import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useStep } from './LayoutTwoFaSetup'

function Congrats() {
	const { setStep } = useStep();

	useEffect(() => {
		setStep(2);
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 }
		});
	}, []);

	return (
		<div className="congrats-container">
			<h1 className="congrats-message">Congrats!</h1>
		</div>
	);
}

export default Congrats;
