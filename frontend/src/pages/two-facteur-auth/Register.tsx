import { useEffect, useState } from 'react';
import { useStep } from './LayoutTwoFaSetup'


function Register() {
	const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
	const [qrCode, setQrCode] = useState('');
	const [secret, setSecret] = useState('');
	const {setStep} = useStep();

	function formatSecret(secret: any) {
		return secret.match(/.{1,4}/g)?.join(' ') || '';
	}

	useEffect(() => {
		setStep(1);
		const token = localStorage.getItem('jwtToken');
		const fetchQrCode = async () => {
			try {
				const response = await fetch(API_BASE_URL + "/auth/register-2fa", {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				});
				const data = await response.json();
				setQrCode(data.qrcode);
				setSecret(data.secret);
			} catch (error) {
				console.error("Erreur lors de la récupération du QR code:", error);
			}
		};

		fetchQrCode();
	}, [API_BASE_URL]);

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
