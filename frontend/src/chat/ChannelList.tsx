import { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { Channel } from './types/channel';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../utils/hooks/useToast';

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
	const {error, success} = useToast();
	const navigate = useNavigate();

	async function joinChannel(channel: Channel) {
		try {
			const token = localStorage.getItem('jwtToken');
			await fetchUrl("/chat/channels/join", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({ 
					roomId: channel.name,
				}),
			})
			navigate(channel.name);
		} catch (err: any) {
			error(err.message);
		}
	}

	useEffect(() => {
		auth?.socket?.on('new-channel', (channel) => {
			setChannels([...channels, channel]);
		});

		auth?.socket?.on('delete-channel', (channel) => {
			setChannels(channels.filter((c: Channel) => c.name !== channel));
		});

		return (() => {
			auth?.socket?.off('new-channel');
			auth?.socket?.off('delete-channel');
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