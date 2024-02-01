import {ChannelList, SearchChannel } from './ChannelList';
import { ChatProvider, useChat, useChatDispatch } from './ChatContext';
import { CreateChannel } from './CreateChannel';
import { fetchUrl } from '../fetch';
import { useEffect } from 'react';
import '../styles/chat.css';

export function Channels() {
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

	return (
		<>
			<CreateChannel />
			<SearchChannel />
			<div className="channelList">
				<ChannelList />
			</div>
		</>
	);
}