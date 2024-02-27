import { useEffect, useState } from 'react';
import { useStep } from './LayoutTwoFaSetup'


function Register() {
	const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
	const [qrCode, setQrCode] = useState(''); // État pour stocker l'URL du QR code
	const [secret, setSecret] = useState(''); // État pour stocker le secret si nécessaire
	const { setStep } = useStep();

	function formatSecret(secret: any) {
		return secret.match(/.{1,4}/g)?.join(' ') || '';
	}

	useEffect(() => {
		setStep(1);
		const token = localStorage.getItem('jwtToken');
		// Fonction pour effectuer la requête fetch
		const fetchQrCode = async () => {
			try {
				const response = await fetch(API_BASE_URL + "/auth/register-2fa", {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				});
				const data = await response.json(); // Supposons que la réponse est au format JSON
				console.log(data);
				// Met à jour l'état avec l'URL du QR code et le secret, si présent dans la réponse
				setQrCode(data.qrcode);
				setSecret(data.secret); // Assure-toi que l'API renvoie un 'secret' si nécessaire
				console.log(qrCode);
			} catch (error) {
				console.error("Erreur lors de la récupération du QR code:", error);
			}
		};

		fetchQrCode(); // Appelle la fonction fetchQrCode définie dans useEffect
	}, [API_BASE_URL]); // Le tableau de dépendances vide signifie que cet effet s'exécutera une fois, après le premier rendu

	return (
		<div>
			<h1>Register ft_transcendance</h1>
			<p>Open the Google Authenticator app and scan this QR code</p>
			{qrCode && <img src={qrCode} alt="QR code" />}
			<p>Or enter the following code manually</p>
			<div style={{ fontFamily: 'monospace', fontSize: '20px', marginTop: '20px' }}>
				{secret && formatSecret(secret)}
			</div>
			<p>Once ft_transcendance of Père Tanguy is registered, you'll start seeing 6-digit verification codes in the app.</p>
		</div>
	);
}

export default Register;
