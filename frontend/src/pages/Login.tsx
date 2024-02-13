import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider'
import { useError } from '../components/ErrorProvider'

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();
    const auth = useAuth();
    const location = useLocation();
    const err = useError();

    const from = location.state?.from?.pathname || '/';

    async function handleSignUp() {
        if (!username || !password) {
            err.setError('Please enter both username and password.');
            return;
        }
        try {
            await auth?.signup(username, password);
            navigate(from, { replace: true });
        } catch (error) {
            console.log(error);
        }
    }

    async function handleSignIn() {
        if (!username || !password) {
            err.setError('Please enter both username and password.');
            return;
        }
        try {
            const isTwoFa = await auth?.getTwoFaStatus(username, password);
            if (isTwoFa) {
                setShowModal(true); // Affiche la modal pour le code TOTP
            } else {
                await auth?.signin(username, password);
                navigate(from, { replace: true });
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function handleTotpSubmit() {
        try {
            await auth?.verifyTotp(username, password, totpCode);
            await auth?.signin(username, password); // Simule la connexion après la vérification TOTP
            setShowModal(false); // Ferme la modal après succès
            navigate(from, { replace: true });
        } catch (error) {
            console.log(error);
            err.setError("Error with 2FA code.");
        }
    }

    return (
        <div className="fix">
            <div className="loginContainer">
                <input
                    className="field"
                    type="text"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className="field"
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="button" onClick={handleSignIn}>Login</button>
                <button className="registerButton" onClick={handleSignUp}>Register</button>
                <a className="registerButton" href={import.meta.env.VITE_URL_OAUTH}>Connect with 42</a>

                {showModal && (
                    <div className="modal">
                        <input
                            type="text"
                            placeholder="TOTP Code"
                            onChange={(e) => setTotpCode(e.target.value)}
                        />
                        <button onClick={handleTotpSubmit}>Submit TOTP</button>
                    </div>
                )}
            </div>
        </div>
    );
}
