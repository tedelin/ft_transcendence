import { useEffect, useState } from 'react';
import { useStep } from './LayoutTwoFaSetup'
import { useNavigate } from 'react-router-dom';


function Verify() {
	const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
	const [code, setCode] = useState('');
	const [verificationStatus, setVerificationStatus] = useState('');
	const { setStep, setAuth } = useStep();
	const navigate = useNavigate()

	useEffect(() => {
		setStep(2);
	}, [])
	const handleInputChange = (event: any) => {
		setCode(event.target.value);
	};

	const handleSubmit = async (event: any) => {
		event.preventDefault();

		if (code.match(/^\d{6}$/)) {
			const token = localStorage.getItem('jwtToken');
			try {
				const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ token: code }),
				});

				const data = await response.json();
				if (data.verified) {
					setVerificationStatus('Verification successful. Two-Factor Authentication is now enabled.');
					setAuth(true)
					navigate('../congrat');
				} else {
					setVerificationStatus('Verification failed. Please try again.');
				}
			} catch (error) {
				console.error('Error verifying the code:', error);
				setVerificationStatus('An error occurred. Please try again later.');
			}
		} else {
			setVerificationStatus('Please enter a valid 6-digit code.');
		}
	};

	return (
		<div>
			<h1>Verify Google Authenticator</h1>
			<p>Enter a code from Google Authenticator to make sure everything works.</p>
			<form onSubmit={handleSubmit}>
				<label>
					6-digit code
					<input
						type="text"
						name="code"
						value={code}
						onChange={handleInputChange}
					/>
				</label>
				<button type="submit">Verify</button>
			</form>
			{verificationStatus && <p>{verificationStatus}</p>}
		</div>
	);
}

export default Verify;
