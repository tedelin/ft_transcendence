import { useState, createContext, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../utils/providers/ThemeProvider";
import { UseStepReturn } from "../../utils/types";

const StepContext = createContext<UseStepReturn>({
	setStep: () => {},
	setAuth: () => {},
  });

export const useStep = () : UseStepReturn => useContext(StepContext);

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
	const handleCancel = () => {
		navigate(-1); 
	};

	const handleNext = () => {
		if (step === 1) {
			navigate("./verify");
		} else if (step === 2) {
			navigate("/settings");
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
						disabled={step === 2 && !auth}
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
