import { useState } from 'react';
import {useAuth } from '../components/AuthProvider'
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/login.css';


export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const auth = useAuth();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

	async function handleSignIn() {
		if (!username || !password) {
			setError('Please enter both username and password.');
			return;
		}
		try {
			await auth?.signin(username, password);
			navigate(from, { replace: true });
		} catch(error) {
			setError('Invalid credentials.');
		}
	}
	
	async function handleSignUp() {
		if (!username || !password) {
			setError('Please enter both username and password.');
			return;
		}
		try {
			await auth?.signup(username, password);
			navigate(from, { replace: true });
		} catch(error) {
			setError('Credentials already taken.');
		}
	}
    return (
        <div className="fix">
            <div className="loginContainer">
                <input
                    className="field"
                    type="text"
                    placeholder="Username"
                    onChange={(e) => {
                        setUsername(e.target.value);
                        setError('');
                    }}
                />
                <input
                    className="field"
                    type="password"
                    placeholder="Password"
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                    }}
                />
                {error && <span className="error">{error}</span>}
                <button
                    className="button"
                    onClick={handleSignIn}
                >
                    Login
                </button>
                <button
                    className="registerButton"
                    onClick={handleSignUp}
                >
                    Register
                </button>
            </div>
        </div>
    );
}