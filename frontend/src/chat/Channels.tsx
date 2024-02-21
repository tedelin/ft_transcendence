import { ChannelList, SearchChannel } from './ChannelList';
import { ChannelActions } from './ChannelActions';
import { fetchUrl } from '../fetch';
import { useEffect, useState } from 'react';
import '../styles/chat.css';

export function Channels() {
	const [channels, setChannels] = useState([]);

	async function fetchChannels() {
		try {
			const data = await fetchUrl('/chat/channels');
			setChannels(data);
		} catch (error) {
			console.error('Error fetching channels:', error);
		}
	};

	useEffect(() => {
		fetchChannels();
	}, []);

	return (
		<>
			<ChannelActions />
			<SearchChannel setChannels={setChannels} />
			<div className="channelList">
				<ChannelList channels={channels} setChannels={setChannels} />
			</div>
		</>
	);
}