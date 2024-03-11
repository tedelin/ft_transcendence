import { useState, createContext, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../utils/providers/ThemeProvider";

// Création d'un contexte pour passer la fonction setStep aux composants enfants
const StepContext = createContext({});

export const useStep = () => useContext(StepContext);

const ProgressionBar = ({ step }: any) => {
	return (
		<div className="progression-bar">
			<div className={`circle ${step >= 1 ? 'active' : ''} ${step === 2 ? 'step-two' : ''}`}>1</div>
			<div className={`line ${step >= 2 ? 'active' : ''}`}></div>
			<div className={`circle ${step >= 2 ? 'active' : ''}`}>2</div>
		</div>
	);
};


function LayoutTwoFaSetup() {
	const [step, setStep] = useState(1);
	const [auth, setAuth] = useState(false)
	const navigate = useNavigate();
	const {theme} = useContext(ThemeContext);

	// Gestion des clics sur le bouton Cancel
	const handleCancel = () => {
		navigate(-1); // Navigue à la page précédente
	};

	// Gestion des clics sur le bouton Next/Done
	const handleNext = () => {
		if (step === 1) {
			// setStep(step + 1); // Passe au step 2
			navigate("./verify"); // Navigue vers la page de validation
		} else if (step === 2) {
			navigate("/settings"); // Navigue vers la page de finition après le dernier step
		}
	};

	return (
		<StepContext.Provider value={{ setStep, setAuth }}>
			<div className={`App ${theme} layout`}>
				<header>
					<p>Two-Factor Authentication</p>
					<ProgressionBar step={step} />
					<p>Step : {step}/2</p>
				</header>
				<Outlet />
				<footer>
					<button onClick={handleCancel}>Cancel</button>
					<button
						onClick={handleNext}
						disabled={step === 2 && !auth} // Désactive le bouton si on est à l'étape 2 et que auth est false
						className={
							step < 2
								? 'button-next'
								: auth
									? 'button-done button-done-auth-true'
									: 'button-done button-done-auth-false'
						}
					>
						{step < 2 ? 'Next' : 'Done'}
					</button>
				</footer>
			</div>
		</StepContext.Provider>
	);
}

export default LayoutTwoFaSetup;
