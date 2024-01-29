import { useState, useEffect, useRef } from 'react';
import { fetchUrl } from '../fetch';
import { useChat } from './ChatContext';
import { useAuth } from "../components/AuthProvider";
import '../styles/chat.css';

export function MessageDisplay({}) {
	const [receivedMessages, setReceivedMessages] = useState([]);
	const messageContainer = useRef(null);
    const chat = useChat();
	const auth = useAuth();

	async function fetchChannelsMessages() {
		try {
			const response = await fetchUrl(`/chat/channels/${chat.channelTo?.name}/messages`);
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
			if (message.channelId !== chat.channelTo?.name) {
				return ;
			}
			setReceivedMessages(prevMessages => [...prevMessages, message]);
		});
		
		if (chat.channelTo)
			fetchChannelsMessages();

		return () => {
			setReceivedMessages([]);
			auth?.socket?.off('channel-message');
		};
	}, [chat.channelTo]);

	useEffect(() => {
		scrollToBottom();
	}, [receivedMessages]);

	return (
		<div ref={messageContainer} className='messageContainer'>
            {receivedMessages.map((msg) => (
               <div className={msg.senderId === auth?.user?.id ? 'bubble-right' : 'bubble-left'} key={msg.id}>
                   <div className="sender">
              			{/* <img src="https://imgs.search.brave.com/MWlI8P3aJROiUDO9A-LqFyca9kSRIxOtCg_Vf1xd9BA/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc" alt="User Avatar"></img> */}
						<div className="senderName">
                            {}
				        </div>
                    </div>
                   <div className="message">{msg.content}</div>
                   <div className="timestamp">{msg.timestamp}</div>
           </div>
            ))}
		</div>
	);
}
