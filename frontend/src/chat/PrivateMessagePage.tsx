import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { useToast } from '../utils/hooks/useToast';
import { fetchUrl } from '../fetch';
import {PrivateMessagesDisplay} from './PrivateMessageDisplay';

export function PrivateMessagePage() {
	const [message, setMessage] = useState('');
	const [typing, setTyping] = useState('');
	const { receiverId } = useParams() as { receiverId: string };
	const { error } = useToast();
	const auth = useAuth();

	function onTyping(e: any) {
		auth?.socket?.emit("typing", { username: auth?.user?.username, roomId: name });
		setMessage(e.target.value);
	}

	async function sendChannelMessage() {
		try {
			await fetchUrl("/private-messages", {
				method: "POST",
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					receiverId: parseInt(receiverId),
					content: message
				}),
			});
			setMessage('');
		} catch (err: any) {
			error(err.message);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key == 'Enter')
			e.preventDefault();
		if (e.key === 'Enter' && !e.shiftKey && message.length > 0) {
			sendChannelMessage();
		}
	};
	
	useEffect(() => {
		auth?.socket?.on("typing", (username: string) => {
			if (username === auth?.user?.username)
			return;
			setTyping(`${username} is typing ...`);
			setTimeout(() => {
				setTyping('');
			}, 3000);
		});
	
		return () => {
			auth?.socket?.off("typing");
		}
	}, [])

	return (
		<>
			<PrivateMessagesDisplay key={receiverId} conversationId={parseInt(receiverId)}/>
			<div className="typingIndicator">{typing}</div>
			<div className='messageInput'>
				<textarea
					value={message}
					onKeyDown={handleKeyDown}
					placeholder={'Send message'}
					onChange={onTyping}
				/>
			</div>
		</>
	);
}