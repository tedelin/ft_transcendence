import { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { Channel } from './types/channel';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

export function SearchChannel({ setChannels }) {
	const [input, setInput] = useState('');

	async function fetchChannels(value: string) {
		const response = await fetchUrl('/chat/channels');
		const filtered = response.filter((channel: Channel) => {
			const channelName = channel.name || '';
			const lowercaseChannelName = channelName.toLowerCase();
			const lowercaseValue = value.toLowerCase();
			return lowercaseChannelName.includes(lowercaseValue);
		});
		setChannels(filtered);
	}

	function handleChange(value: string) {
		setInput(value);
		fetchChannels(value);
	}

	return (
		<>
			<input className="searchBar" type="text" placeholder="Search Public channel" value={input} onChange={e => handleChange(e.target.value)} />
		</>
	)
}


export function ChannelList({ channels, setChannels }) {
	const auth = useAuth();
	const navigate = useNavigate();

	function joinChannel(channel: Channel) {
		auth?.socket?.emit('join-channel', { roomId: channel.name, password: '', userId: auth?.user?.id });
		navigate(channel.name);
	}

	// function leaveChannel() {
	// 	auth?.socket.emit('leave-channel', name);
	// }

	useEffect(() => {
		auth?.socket?.on('new-channel', (channel) => {
			const updatedChannels = [...channels, channel];
			setChannels(updatedChannels);
		});

		return (() => {
			auth?.socket?.off('new-channel');
		});
	}, [channels]);

	return (
		<>
			{channels.map((channel: Channel) =>
				<div
					key={channel.name}
					className="sideBarChatItem"
					onClick={() => { joinChannel(channel) }}
				>
					<img src="https://imgs.search.brave.com/MWlI8P3aJROiUDO9A-LqFyca9kSRIxOtCg_Vf1xd9BA/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc" alt="User Avatar"></img>
					<div className='sideBarChatName'>
						<span>
							{channel.name}
						</span>
					</div>
				</div>
			)}
		</>
	);
}