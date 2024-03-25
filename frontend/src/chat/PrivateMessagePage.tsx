import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { useToast } from '../utils/hooks/useToast';
import { fetchUrl } from '../fetch';
import {PrivateMessagesDisplay} from './PrivateMessageDisplay';
import { User } from '../utils/types';
import { getAvatar } from '../utils/utils';
import '../styles/chat.css';

function TopBar({ userId }: { userId: number }) {
	const [user, setUser] = useState<User>();

	async function fetchUser() {
		try {
			const response = await fetchUrl(`/users/id/${userId}`, {
				method: "GET",
				headers	: {
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
				},
			});
			setUser(response);
		} catch {
			console.log('error');
		}
	}

	useEffect(() => {
		fetchUser();
	}, [userId]);

	return (
		<div className="topBarChat">
			<div className="topChannel">
				{user && <img className="smallAvatar" src={getAvatar(user?.avatar)} alt="avatar" />}
				<span className='spanMargin'>
					{user?.username}
				</span>
			</div>
		</div>
	);
}

export function PrivateMessagePage() {
	const [message, setMessage] = useState('');
	const [typing, setTyping] = useState('');
	const { receiverId } = useParams() as { receiverId: string };
	const { error } = useToast();
	const navigate = useNavigate();
	const [roomId, setRoomId] = useState('');
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

	function sendGameInvite() {
		navigate(`/game?private=${receiverId}`);
	}

	function acceptGameInvite() {
		navigate(`/game?roomId=${roomId}`);
	
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key == 'Enter')
			e.preventDefault();
		if (e.key === 'Enter' && !e.shiftKey && message.length > 0) {
			sendChannelMessage();
		}
	};
	
	useEffect(() => {
		auth?.socket?.emit("getInvitation", receiverId);

		auth?.socket?.on("typing", (username: string) => {
			if (username === auth?.user?.username) return;
			setTyping(`${username} is typing ...`);
			setTimeout(() => {
				setTyping('');
			}, 3000);
		});

		auth?.socket?.on("game-invite", (roomId: string) => {
			setRoomId(roomId);
		});
	
		return () => {
			auth?.socket?.off("typing");
			auth?.socket?.off("game-invite");
		}
	}, [])

	return (
		<>
			<TopBar userId={parseInt(receiverId)} />
			<PrivateMessagesDisplay key={receiverId} conversationId={parseInt(receiverId)}/>
			{roomId.length > 0 && <button onClick={acceptGameInvite} className='acceptInvite'>Accept Invitation to Play</button>}
			<div className="typingIndicator">{typing}</div>
			<div className='messageInput'>
				<textarea
					value={message}
					onKeyDown={handleKeyDown}
					placeholder={'Send message'}
					onChange={onTyping}
				/>
				{roomId.length === 0 && <button
					onClick={sendGameInvite}
					className='inviteButton'
				>
					Invite to play</button>}
			</div>
		</>
	);
}