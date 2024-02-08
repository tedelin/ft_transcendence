import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Validate() {
    const [code, setCode] = useState('');
    const navigate = useNavigate(); // Utiliser useNavigate pour la redirection après la validation

    const handleSubmit = async (event : any) => {
        event.preventDefault();
        const tempToken = localStorage.getItem('tempToken'); // Récupère le tempToken stocké

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tempToken}`,
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                throw new Error('Failed to verify 2FA code');
            }

            const data = await response.json();
            localStorage.setItem('jwtToken', data.access_token); // Stocke le vrai token JWT pour les futures requêtes
            localStorage.removeItem('tempToken'); // Supprime le tempToken car il n'est plus nécessaire

            navigate('/dashboard'); // Redirige l'utilisateur vers la page de tableau de bord ou la page principale de l'application
        } catch (error) {
            console.error('Error during 2FA verification:', error);
            alert('Verification failed. Please try again.'); // Informe l'utilisateur en cas d'échec
        }
    };

    const handleInputChange = (event : any) => {
        setCode(event.target.value);
    };

    return (
        <div>
            <h1>Enter the verification code displayed on Google Authenticator</h1>
            <p>We are asking for this code based on your two-factor authentication preferences.</p>
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
                <button type="submit">Log in</button>
            </form>
        </div>
    );
}

export default Validate;
