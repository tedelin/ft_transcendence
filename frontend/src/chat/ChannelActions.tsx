import React, { useState } from 'react';
import { fetchUrl } from '../fetch';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../utils/hooks/useToast';
import '../styles/chat.css';

export function ChannelActions() {
	const [channelName, setChannelName] = useState('');
	const [channelPassword, setChannelPassword] = useState('');
	const [channelVisibility, setChannelVisibility] = useState('PUBLIC');
	const navigate = useNavigate();
	const { error, success } = useToast();

	async function create() {
		try {
			const requestBody = channelPassword !== '' ?  {
				name: channelName,
				visibility: channelVisibility,
				password: channelPassword,
			} : {
				name: channelName,
				visibility: channelVisibility,
			}
			await fetchUrl('/chat/channels', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
				},
				body: JSON.stringify(requestBody),
			});
			success('Channel created');
		} catch (err: any) {
			error(err.message);
		}
	}

	async function joinChannel() {
		try {
			const requestBody = channelPassword !== '' ?  {
				roomId: channelName,
				visibility: channelVisibility,
				password: channelPassword,
			} : {
				roomId: channelName,
				visibility: channelVisibility,
			}
			await fetchUrl("/chat/channels/join", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
				},
				body: JSON.stringify(requestBody),
			})
			navigate(channelName);
		} catch (err: any) {
			error(err.message);
		}
	}

	function handleVisibilityChange(e: React.ChangeEvent<HTMLSelectElement>) {
		setChannelVisibility(e.target.value);
	}

	return (
		<div className='topContainer'>
			<input
			className='input'
				type="text"
				placeholder="Enter Channel Name"
				value={channelName}
				onChange={(e) => setChannelName(e.target.value)}
			/>
			{channelVisibility === "PROTECTED" && 
			<input
				type="password"
				placeholder="Enter Channel Password"
				value={channelPassword}
				onChange={(e) => setChannelPassword(e.target.value)}
			/>}
			<select className='channelVisibility' value={channelVisibility} onChange={handleVisibilityChange}>
				<option value="PUBLIC">Public</option>
				<option value="PRIVATE">Private</option>
				<option value="PROTECTED">Protected</option>
			</select>
			<button className="createButton" onClick={create}>Create</button>
			<button disabled={channelName.length === 0} className='joinButton' onClick={joinChannel}>Join</button>
		</div>
	);
}