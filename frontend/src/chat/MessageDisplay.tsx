import { useState, useEffect, useRef } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from "../components/AuthProvider";
import '../styles/chat.css';

export function MessageDisplay({channel}) {
	const [receivedMessages, setReceivedMessages] = useState([]);
	const messageContainer = useRef(null);
	const auth = useAuth();

	async function fetchChannelsMessages() {
		try {
			const token = localStorage.getItem('jwtToken');
			const response = await fetchUrl(`/chat/channels/${channel}/messages`, {
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
			messageContainer.current.scrollTop = messageContainer.current.scrollHeight + 1000;
		}
	}

	useEffect(() => {
		auth?.socket?.on('channel-message', (message) => {
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
               <div className={msg.senderId === auth?.user?.id ? 'bubble-right' : 'bubble-left'} key={msg.id}>
                   <div className="sender">
              			<img src={msg.sender?.avatar} alt="User Avatar"></img>
						<div className="senderName">
                            {msg.sender?.username}
				        </div>
                    </div>
                   <div className="message">{msg.content}</div>
                   <div className="timestamp">{msg.timestamp}</div>
           </div>
            ))}
		</div>
	);
}
