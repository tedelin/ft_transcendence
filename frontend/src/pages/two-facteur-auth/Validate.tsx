import { useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

function Validate() {
    const [totp, setTotp] = useState('');
    const [error, setError] = useState('');
    const auth = useAuth();
    const navigate = useNavigate();
    const tempToken = localStorage.getItem('jwtToken');

    const verifyTotp = async (totp, tempToken) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/validate-2fa-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tempToken}`,
                },
                body: JSON.stringify({ totp }),
            });
            const data = await response.json();
            if (data.validated !== true) {
                throw new Error('Code 2FA invalide');
            }
			console.log("data :", data)
			const {access_token} = data.finaltoken;
			console.log(access_token);
            localStorage.setItem('jwtToken', access_token);
            await auth?.handleAuth(access_token);
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Erreur lors de la validation du code 2FA:', error);
            setError('Le code 2FA est incorrect ou a expiré. Veuillez réessayer.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Réinitialise l'état d'erreur

        await verifyTotp(totp, tempToken);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="totp">Code 2FA :</label>
                <input
					className="inputCode"
                    id="totp"
                    type="text"
                    value={totp}
                    onChange={(e) => setTotp(e.target.value)}
                    required
                />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit">Valider</button>
        </form>
    );
}

export default Validate;
