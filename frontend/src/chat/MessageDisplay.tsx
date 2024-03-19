import { useState, useEffect, useRef } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from "../components/AuthProvider";
import { ChannelMessage } from '../utils/types';
import { getAvatar } from '../utils/utils';
import { useNavigate } from 'react-router';
import '../styles/chat.css';

export function MessageDisplay({ channel }: { channel: string }) {
	const [receivedMessages, setReceivedMessages] = useState<ChannelMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [offset, setOffset] = useState(0);
	const navigate = useNavigate();
	const auth = useAuth();
	const messageContainer = useRef<HTMLDivElement>(null);
	const prevScrollHeightRef = useRef<number | null>(null);

	async function fetchChannelsMessages() {
		try {
			setIsLoading(true);
			const response = await fetchUrl(`/chat/channels/messages/${channel}?offset=${offset}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
				},
			});
			setReceivedMessages(prevMessages => [...response, ...prevMessages]);
			setOffset(prevOffset => prevOffset + response.length);
			prevScrollHeightRef.current = messageContainer.current?.scrollHeight || null;
		} catch (error) {
			console.error('Error fetching channels:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		auth?.socket?.on('channel-message', (message: ChannelMessage) => {
			if (message.channelId !== channel) {
				return;
			}
			setReceivedMessages(prevMessages => [...prevMessages, message]);
			if (messageContainer.current) {
				messageContainer.current.scrollTop = messageContainer.current.scrollHeight;
			}
		});

		fetchChannelsMessages();

		return () => {
			setReceivedMessages([]);
			auth?.socket?.off('channel-message');
		};
	}, []);

	function handleScroll() {
		if (messageContainer.current) {
			const { scrollTop } = messageContainer.current;
			if (scrollTop === 0 && !isLoading) {
				fetchChannelsMessages();
			}
		}
	};

	useEffect(() => {
		if (!isLoading && firstLoad) {
			scrollToBottom();
			setFirstLoad(false);
		}
	
		if (messageContainer.current) {
			messageContainer.current.addEventListener('scroll', handleScroll);
		}
	
		if (messageContainer.current && prevScrollHeightRef.current !== null) {
			const newScrollTop = messageContainer.current.scrollHeight - prevScrollHeightRef.current;
			messageContainer.current.scrollTop += newScrollTop;
			prevScrollHeightRef.current = messageContainer.current.scrollHeight;
		}
	
		return () => {
			if (messageContainer.current) {
				messageContainer.current.removeEventListener('scroll', handleScroll);
			}
		};
	}, [isLoading, receivedMessages]);

	function scrollToBottom() {
		if (messageContainer.current) {
			messageContainer.current.scrollTop = messageContainer.current.scrollHeight;
		}
	}

	return (
		<div ref={messageContainer} className='messageContainer'>
			{receivedMessages.map((msg) => (
				<div
					key={msg.id}
					className={msg.sender.id === auth?.user?.id ? 'bubble-right' : 'bubble-left'}
				>
					<div className="sender"
						onClick={() => navigate('/profil/' + msg.sender.id)}
					>
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
