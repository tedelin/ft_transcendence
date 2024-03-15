import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import "../styles/twofa-setup.css";
import { useToast } from '../utils/hooks/useToast';

function TwoFaSettings() {
	const {error } = useToast();
	const navigate = useNavigate(); 
	const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

	const useTwoFA = useAuth()?.user?.useTwoFA;

	const handleClick = () => {
		if (useTwoFA) {
			handleTurnOff();
		} else {
			navigate('/two-factor-auth/setup/register');
		}
	};

	const handleTurnOff = async () => {
		const confirmTurnOff = window.confirm("Are you sure you want to turn off 2FA?");
		
		if (confirmTurnOff) {
			const token = localStorage.getItem('jwtToken');
			try {
				const response = await fetch(`${API_BASE_URL}/auth/turnOff-2fa`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				});
	
				if (response.ok) {
				} else {
					alert('Échec de la désactivation de 2FA. Veuillez réessayer.');
				}
				window.location.reload();
			} catch (err: any) {
				error('Une erreur est survenue lors de la désactivation de 2FA. Veuillez réessayer.');
			}
		} else {
			console.log('Désactivation de 2FA annulée par l\'utilisateur');
		}
	};
	
	return (
		<div className='two-fa-settings'>
			<div><strong>Two-Factor Authentication</strong></div>
			<div>
				<button className="twofaButton" onClick={handleClick}>{useTwoFA ? 'Turn off' : 'Set up'}</button>
			</div>
		</div>
	);
}



export default TwoFaSettings;