import { useState, useEffect, useRef } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from "../components/AuthProvider";
import { ChannelMessage } from '../utils/types';
import '../styles/chat.css';
import { getAvatar } from '../utils/utils';

export function MessageDisplay({channel} : {channel: string}) {
	const [receivedMessages, setReceivedMessages] = useState<ChannelMessage[] | []>([]);
	const messageContainer = useRef(null);
	const auth = useAuth();
	
	async function fetchChannelsMessages() {
		try {
			const token = localStorage.getItem('jwtToken');
			const response = await fetchUrl(`/chat/channels/messages/${channel}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});
			setReceivedMessages(response);
		} catch (error) {
			console.error('Error fetching channels:', error);
		}
	};


	function scrollToBottom() {
		if (messageContainer.current) {
			(messageContainer.current as HTMLElement).scrollTop = (messageContainer.current as HTMLElement).scrollHeight + 1000;
		}
	}

	useEffect(() => {
		auth?.socket?.on('channel-message', (message: ChannelMessage) => {
			if (message.channelId !== channel) {
				return ;
			}
			setReceivedMessages(prevMessages => [...prevMessages, message]);
		});
		
		if (channel)
			fetchChannelsMessages();

		return () => {
			setReceivedMessages([]);
			auth?.socket?.off('channel-message');
		};
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [receivedMessages]);

	return (
		<div ref={messageContainer} className='messageContainer'>
            {receivedMessages.map((msg) => (
               <div className={msg.sender.id === auth?.user?.id ? 'bubble-right' : 'bubble-left'} key={msg.id}>
                   <div className="sender">
              			<img src={getAvatar(msg.sender.avatar)} alt="User Avatar"></img>
						<div className="senderName">
                            {msg.sender?.username}
				        </div>
                    </div>
                   <div className="message">{msg.content}</div>
				   <div className="timestamp">{new Date(msg.timestamp).toLocaleString()}</div>
           </div>
            ))}
		</div>
	);
}
