import React, { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { Modal } from './Modal';
import { useToast } from '../utils/hooks/useToast';
import { useNavigate } from 'react-router-dom';

export function Callback() {
	const code = new URLSearchParams(window.location.search).get('code');
	const [requireTwoFa, setRequireTwoFa] = useState(false);
	const [requireUsername, setRequireUsername] = useState(false);
	const [username, setUsername] = useState('');
	const [userCode, setUserCode] = useState('');
	const [token42, setToken42] = useState('');
	const navigate = useNavigate();
	const {error} = useToast();

	async function registerUser() {
		try {
			const response = await fetchUrl('/auth/42signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token42}`,
				},
				body: JSON.stringify({
					username : username,
				}),
			});
			if (response.access_token) {
				localStorage.setItem('jwtToken', response.access_token);
				navigate('/');
			}
		} catch (err: any) {
			error(err.message);
		}
	}

	async function verify2fa() {
		try {
			const response = await fetchUrl('/auth/validate-2fa', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token42}`,
				},
				body: JSON.stringify({
					code: userCode,
				}),
			});
		
			if (response.access_token) {
				localStorage.setItem('jwtToken', response.access_token);
				navigate('/chat/channels');
			}
		} catch (err: any) {
			error(err.message);
		}
	}

	async function callback() {
		try {
			const response = await fetchUrl('/auth/callback?code=' + code, {
				method: 'GET',
			});
			if (response.requireTwoFa) {
				setRequireTwoFa(true);
			} else if (response.requireUsername) {
				setRequireUsername(true);
			} else if (response.access_token) {
				localStorage.setItem('jwtToken', response.access_token);
				navigate('/');
			}
			setToken42(response.token42);
		} catch (err: any) {
			error(err.message);
		}
	}

	useEffect(() => {
		if (code)
			callback();
	}, [code]);

	return (
		<>
			<Modal
				title="Two Factor Authentication"
				isOpen={requireTwoFa}
				onClose={() => setRequireTwoFa(false)}
			>
				<div>
					<label htmlFor="code">Enter the code from your authenticator app</label>
					<input 
						type="text"
						id="code"
						value={userCode}
						onChange={(e) => setUserCode(e.target.value)}
					/>
					<button
						onClick={verify2fa}
					>
						Submit
					</button>
				</div>
			</Modal>
			<Modal
				title="Complete User Profile"
				isOpen={requireUsername}
				onClose={() => setRequireUsername(false)}
			>
				<input 
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<button
					onClick={registerUser}
				>
					Submit
				</button>
			</Modal>
		</>
	);
}