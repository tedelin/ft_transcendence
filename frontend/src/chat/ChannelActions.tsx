import React, { useState } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from '../components/AuthProvider';
import { useError } from '../components/ErrorProvider';
import { useNavigate } from 'react-router-dom';
import '../styles/chat.css';

export function ChannelActions() {
	const auth = useAuth();
	const [channelName, setChannelName] = useState('');
	const [channelPassword, setChannelPassword] = useState('');
	const [channelVisibility, setChannelVisibility] = useState('public');
	const navigate = useNavigate();
	const err = useError();

	async function create() {
		if (channelName.length < 2 || channelName.length > 13) {
			err.setError('Channel name must be between 2 and 13 characters');
			return;
		}
		try {
			await fetchUrl('/chat/channels', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: channelName,
					password: channelPassword,
					visibility: channelVisibility,
				}),
			});
			if (channelVisibility === 'public') {
				auth?.socket?.emit('new-channel', { name: channelName, visibility: channelVisibility });
			}
			setChannelName('');
			setChannelPassword('');
		} catch (error: any) {
			err.setError(error.message);
		}
	}

	async function joinChannel() {
		try {
			auth?.socket?.emit('join-channel', { roomId: channelName, password: channelPassword, userId: auth?.user?.id });
			navigate(channelName);
		} catch (error: any) {
			err.setError(error.message);
		}
	}

	function handleVisibilityChange(e: React.ChangeEvent<HTMLSelectElement>) {
		setChannelVisibility(e.target.value);
	}

	return (
		<div className='createChannelContainer'>
			<input
				type="text"
				placeholder="Enter Channel Name"
				value={channelName}
				onChange={(e) => setChannelName(e.target.value)}
			/>
			{channelVisibility === "protected" && <input
				type="password"
				placeholder="Enter Channel Password"
				value={channelPassword}
				onChange={(e) => setChannelPassword(e.target.value)}
			/>}
			<select value={channelVisibility} onChange={handleVisibilityChange}>
				<option value="public">Public</option>
				<option value="private">Private</option>
				<option value="protected">Protected</option>
			</select>
			<button className="createButton" onClick={create}>Create</button>
			<button disabled={channelName.length === 0} className='joinButton' onClick={joinChannel}>Join</button>
		</div>
	);
}