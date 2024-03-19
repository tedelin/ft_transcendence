import { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { Modal } from './Modal';
import { useToast } from '../utils/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import Avatar from '../components/Settings/Avatar';
import defaultAvatar from '../assets/default-avatar.jpg'

export function Callback() {
	const code = new URLSearchParams(window.location.search).get('code');
	const [requireTwoFa, setRequireTwoFa] = useState(false);
	const [requireUsername, setRequireUsername] = useState(false);
	const [username, setUsername] = useState('');
	const [userCode, setUserCode] = useState('');
	const [token42, setToken42] = useState('');
	const navigate = useNavigate();
	const { error } = useToast();
	const auth = useAuth();
	const [avatar, setAvatar] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | ArrayBuffer | null>(defaultAvatar);

	const handleFileChange = (e : any) => {
		const file = e.target.files[0];
		if (file) {
			setAvatar(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};


	async function registerUser() {
		try {
			const formData = new FormData();
			formData.append('username', username);
			if (avatar) {
				formData.append('avatar', avatar, avatar.name);
			}
	
			const response = await fetchUrl('/auth/42signup', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token42}`,
				},
				body: formData,
			});
			if (response.access_token) {
				await auth?.fetchUser(response.access_token);
				navigate('/game');
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
				await auth?.fetchUser(response.access_token);
				navigate('/game');
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
				await auth?.fetchUser(response.access_token);
				navigate('/game');
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
		<div className='chatArea'>
			<Modal
				isOpen={requireTwoFa}
				onClose={() => setRequireTwoFa(false)}
			>
				<div className='fieldInfo'>Enter the code from your authenticator app</div>
				<div className='modalContainer'>
					<input
						type="text"
						className='edit'
						id="code"
						value={userCode}
						onChange={(e) => setUserCode(e.target.value)}
					/>
					<button
						className='modalButton blue'
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
				<div className='modalContainer'>
					<input
						className='edit'
						type="text"
						placeholder='Enter your username'
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<h3>Choose your Avatar</h3>
					<div className='AvatarModal'>
						<Avatar handleFileChange={handleFileChange} preview={preview} />
					</div>
					<button
						className='modalButton blue'
						onClick={registerUser}
					>
						Submit
					</button>
				</div>
			</Modal>
		</div>
	);
}