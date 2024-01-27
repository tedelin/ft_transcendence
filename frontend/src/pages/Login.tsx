import { useState } from 'react';
import {useAuth } from '../components/AuthProvider'
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/login.css';


export default function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();
	const auth = useAuth();
	const location = useLocation();

	const from = location.state?.from?.pathname || '/';

	function signin() {
		auth?.signin(username, password, () => {
			navigate(from, { replace: true });
		});
	}
	function signup() {
		auth?.signup(username, password, () => {
			navigate(from, { replace: true });
		});
	}
	

	return (
        <div className="fix">
            <div className="loginContainer">
                <input className="field" type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
                <input className="field" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                <button className="button" onClick={signin}>Login</button>
                <button className="button" onClick={signup}>Register</button>
            </div>
        </div>
	)
}