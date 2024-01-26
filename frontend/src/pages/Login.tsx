import React, { use, useState, useEffect } from 'react';
import { fetchUrl } from '../fetch';
import '../styles/login.css';

export default function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	async function signup() {
		try {
			const response = await fetchUrl('/auth/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body : `username=${username}&password=${password}`
			});
			localStorage.setItem('jwtToken', response.access_token);
			// setPassword('');
			// setUsername('');
		} catch (error) {
			alert('Error creating user');
		}
	}

	async function signin() {
		try {
			const response = await fetchUrl('/auth/signin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body : `username=${username}&password=${password}`
			});
			localStorage.setItem('jwtToken', response.access_token);
			// setPassword('');
			// setUsername('');
		} catch (error) {
			console.log(error);
			alert('Error signing in');
		}
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