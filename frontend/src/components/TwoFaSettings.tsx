import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import "../styles/twofa-setup.css";

function TwoFaSettings() {
	const useTwoFA = useAuth()?.user?.useTwoFA;
	const navigate = useNavigate(); // useNavigate pour la redirection
	const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


	const handleClick = () => {
		if (useTwoFA) {
			handleTurnOff();
		} else {
			navigate('/two-factor-auth/setup/register');
		}
	};

	const handleTurnOff = async () => {
		const confirmTurnOff = window.confirm("t'es sur ??");
		
		if (confirmTurnOff) {
			const token = localStorage.getItem('jwtToken');
			console.log('Désactivation de 2FA...');
			try {
				const response = await fetch(`${API_BASE_URL}/auth/turnOff-2fa`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				});
	
				if (response.ok) {
					console.log('2FA désactivé avec succès');
				} else {
					console.error('Échec de la désactivation de 2FA:', response.statusText);
					alert('Échec de la désactivation de 2FA. Veuillez réessayer.');
				}
			} catch (error) {
				console.error('Erreur lors de la désactivation de 2FA:', error);
				alert('Une erreur est survenue lors de la désactivation de 2FA. Veuillez réessayer.');
			}
		} else {
			console.log('Désactivation de 2FA annulée par l\'utilisateur');
		}
	};
	

	return (
		<div className='two-fa-settings'>
			<div><strong>Two-Factor Authentication</strong></div>
			<div>
				<button onClick={handleClick}>{useTwoFA ? 'Turn off' : 'Set up'}</button>
			</div>
		</div>
	);
}



export default TwoFaSettings;