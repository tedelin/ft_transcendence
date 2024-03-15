import { useState, useEffect, useRef } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from "../components/AuthProvider";
import { ChannelMessage } from '../utils/types';
import { Moderation } from './Moderation';
import '../styles/chat.css';
import { getAvatar } from '../utils/utils';
import { useNavigate } from 'react-router';

export function MessageDisplay({ channel }: { channel: string }) {
	const [receivedMessages, setReceivedMessages] = useState<ChannelMessage[]>([]);
	const [contextMenuUser, setContextMenuUser] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [offset, setOffset] = useState(0);
	const messageContainer = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const auth = useAuth();

	async function fetchChannelsMessages() {
		try {
			setIsLoading(true);
			const token = localStorage.getItem('jwtToken');
			const response = await fetchUrl(`/chat/channels/messages/${channel}?offset=${offset}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});
			setReceivedMessages(prevMessages => [...response, ...prevMessages]);
			setOffset(prevOffset => prevOffset + response.length);
		} catch (error) {
			console.error('Error fetching channels:', error);
		} finally {
			setIsLoading(false);
		}
	};

	function handleContextMenu(userId: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		event.preventDefault();
		setContextMenuUser(userId);
	}

	function closeContextMenu() {
		setContextMenuUser(null);
	}

	useEffect(() => {
		auth?.socket?.on('channel-message', (message: ChannelMessage) => {
			if (message.channelId !== channel) {
				return;
			}
			setReceivedMessages(prevMessages => [...prevMessages, message]);
			scrollToBottom();
		});

		fetchChannelsMessages();

		return () => {
			setReceivedMessages([]);
			auth?.socket?.off('channel-message');
		};
	}, []);

	function handleScroll() {
		if (messageContainer.current) {
			const { scrollTop, clientHeight } = messageContainer.current;
			if (scrollTop === 0 && !isLoading) {
				fetchChannelsMessages();
			}
		}
	};

	useEffect(() => {
		if (messageContainer.current) {
			messageContainer.current.addEventListener('scroll', handleScroll);
		}
		return () => {
			if (messageContainer.current) {
				messageContainer.current.removeEventListener('scroll', handleScroll);
			}
		};
	}, [isLoading]);

	function scrollToBottom() {
		if (messageContainer.current) {
			messageContainer.current.scrollTop = messageContainer.current.scrollHeight;
		}
	}

	return (
		<>
			<div ref={messageContainer} className='messageContainer'>
				{receivedMessages.map((msg) => (
					<div
						key={msg.id}
						className={msg.sender.id === auth?.user?.id ? 'bubble-right' : 'bubble-left'}
					>
						<div className="sender"
							onClick={() => navigate('/profil/' + msg.sender.id)}
							onContextMenu={(e) => handleContextMenu(msg.sender.id, e)}
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
				{/* {contextMenuUser !== null && (
					<Moderation
						enabled={true}
						channel={channel}
						userId={contextMenuUser}
						setEnabled={closeContextMenu}
					/>
				)} */}
			</div>
		</>
	);
}
