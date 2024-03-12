import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../utils/hooks/useToast';
import { validateInput } from '../utils/utils';
import '../styles/login.css';


export default function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const usernamePattern = /^[a-zA-Z0-9_]{2,32}$/;
	const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{":?><,./;'[\]\\\-]).{8,128}$/;

	const navigate = useNavigate();
	const auth = useAuth();
	const location = useLocation();
	const { error } = useToast();

	const from = location.state?.from?.pathname || '/';

	async function handleSignIn() {
		// if (!validateInput(username, usernamePattern)) {
		// 	error('Username must be between 2 and 32 characters and contain only letters, numbers, and underscores.');
		// 	return;
		// }
		// if (!validateInput(password, passwordPattern)) {
		// 	error('Password must be between 8 and 128 characters and contain at least one digit, one lowercase letter, one uppercase letter, and one special character.');
		// 	return;
		// }
		try {
			await auth?.signin(username, password);
			navigate(from, { replace: true });
		} catch (err: any) {
			error(err.message);
		}
	}

	async function handleSignUp() {
		// if (!validateInput(username, usernamePattern)) {
		// 	error('Username must be between 2 and 32 characters and contain only letters, numbers, and underscores.');
		// 	return;
		// }
		// if (!validateInput(password, passwordPattern)) {
		// 	error('Password must be between 8 and 128 characters and contain at least one digit, one lowercase letter, one uppercase letter, and one special character.');
		// 	return;
		// }
		try {
			await auth?.signup(username, password);
			navigate(from, { replace: true });
		} catch (err: any) {
			error(err.message, "salut");
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
				<button className="loginButton" onClick={handleSignIn}>Login</button>
				<button className="registerButton" onClick={handleSignUp}>Register</button>
				<a className="registerButton" href={import.meta.env.VITE_URL_OAUTH}>Connect with 42</a>
			</div>
		</div>
	);
}
