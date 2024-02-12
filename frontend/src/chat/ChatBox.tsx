import { useEffect, useState } from "react";
import { MessageDisplay } from './MessageDisplay';
import { useAuth } from "../components/AuthProvider";
import { useParams } from "react-router-dom";
import '../styles/chat.css';
import { useError } from "../components/ErrorProvider";
import { fetchUrl } from "../fetch";

function Settings({enabled, channel}) {
	const [channelUsers, setChannelUsers] = useState([]);
	const err = useError();

	async function fetchChannelUsers() {
		try {
			const response = await fetchUrl(`/chat/channels/users/${channel}`, {
				method: 'GET',
			});
			setChannelUsers(response);
		} catch (error) {
			err.setError(error.message);
		}
	}

	async function banUser(userId: number, roomId: string) {
		try {
			const token = localStorage.getItem('jwtToken');
			await fetchUrl(`/moderation/ban/${roomId}/${userId}`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
		} catch (error) {
			err.setError(error.message)
		}
	}

	async function kickUser(userId: number, roomId: string) {
		try {
			const token = localStorage.getItem('jwtToken');
			await fetchUrl(`/moderation/kick/${roomId}/${userId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
		} catch (error) {
			err.setError(error.message)
		}
	}

	useEffect(() => {
		if (enabled)
			fetchChannelUsers();
	}, [enabled]);

	return (
		enabled && (
			<div className="userList">
				{channelUsers.map((channel) => (
					<div key={channel.user.id} className="user">
						{/* <img src={channel.user.avatar} alt="User Avatar"></img> */}
						<span>{channel.user.username}</span>
						<button 
							className="declineFriend"
							onClick={() => {kickUser(channel.user.id, channel.channelName)}}
						>
							Kick
						</button>
						<button 
							className="declineFriend"
							onClick={() => {banUser(channel.user.id, channel.channelName)}}
						>
							Ban
						</button>
					</div>
				))}
			</div>
		)
	)
}

function TopBar({channel}) {
	const [settings, setSettings] = useState(false);

	return (
		<div className="topBarChat">
			<Settings key={channel.id} enabled={settings} channel={channel} />
			<img className="smallAvatar" src="https://imgs.search.brave.com/MWlI8P3aJROiUDO9A-LqFyca9kSRIxOtCg_Vf1xd9BA/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc" alt="User Avatar"></img>
			<span onClick={() => {setSettings(!settings);}} className='spanMargin'>
				{channel}
			</span>
		</div>
	);
}


export function ChatBox() {
	const [message, setMessage] = useState('');
	const [typing, setTyping] = useState('');
	const { name } = useParams();
	const auth = useAuth();
	const err = useError();

	function onTyping(e: any) {
		auth?.socket?.emit("typing", { username: auth?.user?.username, roomId: name });
		setMessage(e.target.value);
	}

	async function sendChannelMessage() {
		try {
			await fetchUrl("/chat/channels/message", {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					channelId: name,
					senderId: auth?.user?.id, 
					content: message 
				}),
			});
			setMessage('');
		} catch (error: any) {
			err.setError(error.message);
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
	}, [])

	return (
		<>
			<TopBar channel={name}/>
			<MessageDisplay key={name} channel={name} />
			<div className="typingIndicator">{typing}</div>
			<div className='messageInput'>
				<textarea
					value={message}
					onKeyDown={handleKeyDown}
					placeholder={'Send message to ' + name}
					onChange={onTyping}
				/>
				<button className='inviteBtn'>
					<span className="material-symbols-outlined">
						stadia_controller
					</span>
				</button>
				<button
					className='sendMessageBtn'
					disabled={message.length === 0}
					onClick={sendChannelMessage}
				>
					<span className="material-symbols-outlined">
						send
					</span>
				</button>
			</div>
		</>
	);
}