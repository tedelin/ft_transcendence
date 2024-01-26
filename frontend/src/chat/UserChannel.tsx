import React, { useEffect, useState } from 'react';
import { useChatDispatch, useChat } from './ChatContext';
import { fetchUrl } from '../fetch';
import { Channel } from './types/channel';
import { useUser } from '../components/AuthProvider';
import socket from '../socket';


export function UserChannel() {
    const dispatch = useChatDispatch();
	const [channels, setChannels] = useState([]);
    const chat = useChat();
	const user = useUser();

	async function fetchUserChannels() {
		try {
			if (user) {
				const response = await fetchUrl(`/users/${user.id}/channels`);
				setChannels(response.channels);
			}
		} catch (error) {
			console.log(error);
		}
	}

    async function displayChannel(channel) {
		const getChannel = await fetchUrl(`/chat/channels/${channel.channelName}`);
		leaveChannel();
		dispatch({type: 'chat'});
        dispatch({ type: 'setChannel', channelTo: getChannel });
    }

    function leaveChannel() {
        dispatch({ type: 'setChannel', channelTo: null as any });
    }

	useEffect(() => {
		fetchUserChannels();
	}, [user, chat.channelTo]);

	return (
		<>
			{channels.map((channel: Channel) =>
				<div 
					key={channel.channelName}
					className={chat.channelTo && channel.channelName === chat.channelTo.name ? "sideBarSelected" : "sideBarChatItem"}
					onClick={() => { displayChannel(channel) }}
				>
					<img src="https://imgs.search.brave.com/MWlI8P3aJROiUDO9A-LqFyca9kSRIxOtCg_Vf1xd9BA/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc" alt="User Avatar"></img>
					<div className='sideBarChatName'>
						{channel.channelName}
					</div>
				</div>
			)}
		</>
	);
}