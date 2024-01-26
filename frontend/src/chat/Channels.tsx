import {ChannelList, SearchChannel } from './ChannelList';
import { useChat, useChatDispatch } from './ChatContext';
import { CreateChannel } from './CreateChannel';
import { fetchUrl } from '../fetch';
import { useEffect } from 'react';
import '../styles/chat.css';

export function Channels() {
	const chat = useChat();
	const dispatch = useChatDispatch();

	async function fetchChannels() {
		try {
		  const data = await fetchUrl('/chat/channels');	  
		  dispatch({ type: 'fetchChannels', channels: data });
		  dispatch({ type: 'searchChannels', channels: data });
		} catch (error) {
		  console.error('Error fetching channels:', error);
		}
	};
	
	useEffect(() => {
		fetchChannels();
	}, []);

	return ( (chat.active === 'channels' && (
		<div className='chatArea'>
			<CreateChannel />
			<SearchChannel />
			<div className="channelList">
				<ChannelList />
			</div>
		</div>
	)));
}