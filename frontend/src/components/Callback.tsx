import React, { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { Modal } from './Modal';
import { useToast } from '../utils/hooks/useToast';
import { useNavigate } from 'react-router-dom';

export function Callback() {
	const code = new URLSearchParams(window.location.search).get('code');
	const [requireTwoFa, setRequireTwoFa] = useState(false);
	const navigate = useNavigate();
	const {error} = useToast();

	async function getToken() {
		try {
			const response = await fetchUrl('/auth/callback?code=' + code, {
				method: 'GET',
			});
			if (response.requireTwoFa) {
				setRequireTwoFa(true);
			} else if (response.requireUsername) {
			} else if (response.accessToken) {
				localStorage.setItem('jwtToken', response.accessToken);
				navigate('/')
			}
		} catch (err: any) {
			error(err.message);
		}
	}

	useEffect(() => {
		if (code)
			getToken();
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
					<input type="text" id="code" />
					<button
						onClick={getToken}
					>
						Submit
					</button>
				</div>
			</Modal>
		</>
	);
}