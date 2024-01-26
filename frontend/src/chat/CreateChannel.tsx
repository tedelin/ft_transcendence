import React, { useState} from 'react';
import { fetchUrl } from '../fetch';
import { useChatDispatch } from './ChatContext';
import { useUser } from '../components/AuthProvider';
import socket from '../socket';
import '../styles/chat.css';

export function CreateChannel() {
	const [channelName, setChannelName] = useState('');
	const [channelPassword, setChannelPassword] = useState('');
	const [channelVisibility, setChannelVisibility] = useState('public');
	const [errorMessage, setErrorMessage] = useState('');
	const dispatch = useChatDispatch();
	const user = useUser();

	async function create() {
		if (channelName.length < 2 || channelName.length > 13) {
			setErrorMessage('Channel name must be between 3 and 12 characters');
			setTimeout(() => setErrorMessage(''), 3000);
			return ;
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
		  	socket.emit('new-channel', {name: channelName, visibility: channelVisibility});
		  }
		  setChannelName('');
		  setChannelPassword('');
		} catch (error) {
			setErrorMessage('Error creating channel check if channel already exists');
		  	setTimeout(() => setErrorMessage(''), 3000);
		}
	}

	async function joinChannel() {
		try {
			const channel = await fetchUrl(`/chat/channels/${channelName}`);
			socket.emit('join-channel', {roomId: channelName, password: channelPassword, userId: user.id});
			dispatch({ type: 'chat' });
			dispatch({ type: 'setChannel', channelTo: channel });
		} catch (error) {
			setErrorMessage('Failed to join channel check if channel exists or password is correct');
		  	setTimeout(() => setErrorMessage(''), 3000);
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
		  {errorMessage && (
			<div className="notification">
				{errorMessage}
			</div>
		  )}
		</div>
	  );
}