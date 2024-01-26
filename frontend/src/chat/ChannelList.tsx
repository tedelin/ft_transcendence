import React, { useEffect, useState } from 'react';
import { useChatDispatch, useChat } from './ChatContext';
import { fetchUrl } from '../fetch';
import { Channel } from './types/channel';
import { useUser } from '../components/AuthProvider';
import socket from '../socket';

export function SearchChannel({}) {
	const [input, setInput] = useState('');
    const dispatch = useChatDispatch();

	async function fetchChannels(value: string) {
		const response = await fetchUrl('/chat/channels');
		const filtered = response.filter((channel: Channel) => {
			const channelName = channel.name || '';
			const lowercaseChannelName = channelName.toLowerCase();
			const lowercaseValue = value.toLowerCase();
			return lowercaseChannelName.includes(lowercaseValue);
		});
        dispatch({ type: 'searchChannels', channels: filtered });
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


export function ChannelList() {
    const dispatch = useChatDispatch();
	const channels = useChat().searchChannels;
    const chat = useChat();
	const user = useUser();

    function joinChannel(channel: Channel) {
		if (user) {
			socket.emit('join-channel', {roomId: channel.name, password: '', userId: user.id});
			leaveChannel();
			dispatch({type: 'chat'});
			dispatch({ type: 'setChannel', channelTo: channel });
		}
    }

    function leaveChannel() {
        if (chat.channelTo) {
            socket.emit('leave-channel', chat.channelTo.name);
            dispatch({ type: 'setChannel', channelTo: null as any });
        }
    }

	useEffect(() => {
		socket.on('new-channel', (channel) => {
			const updatedChannels = [...channels, channel];
			dispatch({ type: 'searchChannels', channels: updatedChannels });	
		});

		return (() => {
			socket.off('new-channel');
		});
	}, [channels, user]);

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