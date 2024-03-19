import { useEffect, useState } from "react";
import { MessageDisplay } from './MessageDisplay';
import { useAuth } from "../components/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUrl } from "../fetch";
import { useToast } from "../utils/hooks/useToast";
import { ChannelSettings } from "./ChannelSettings";
import '../styles/chat.css';

function TopBar({ channel }) {
	const [moderation, setModeration] = useState(false);
	const [settings, setSettings] = useState(false);
	const { error } = useToast();
	const navigate = useNavigate();

	async function leaveChannel() {
		try {
			await fetchUrl("/chat/channels/leave", {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
				},
				body: JSON.stringify({
					roomId: channel,
				}),
			});
			navigate('/chat/channels');
		} catch (err: any) {
			error(err.message);
		}
	}

	return (
		<div className="topBarChat">
			<ChannelSettings key={channel.id} enabled={settings} name={channel} setEnabled={setSettings} />
			<div className="topChannel">
				<img className="smallAvatar" src="https://imgs.search.brave.com/MWlI8P3aJROiUDO9A-LqFyca9kSRIxOtCg_Vf1xd9BA/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc" alt="User Avatar"></img>
				<span onClick={() => { setModeration(!moderation); }} className='spanMargin'>
					{channel}
				</span>
			</div>
			<div className="topSettings">
				<span
					className="material-symbols-outlined"
					onClick={leaveChannel}
				>
					logout
				</span>
				<span onClick={() => { setSettings(!settings); }} className='material-symbols-outlined' >settings</span>
			</div>
		</div>
	);
}

export function ChatBox() {
	const [message, setMessage] = useState('');
	const [typing, setTyping] = useState('');
	const { name } = useParams();
	const navigate = useNavigate();
	const { error } = useToast();
	const auth = useAuth();

	function onTyping(e: any) {
		auth?.socket?.emit("typing", { username: auth?.user?.username, roomId: name });
		setMessage(e.target.value);
	}

	async function sendChannelMessage() {
		try {
			await fetchUrl(`/chat/channels/${name}/message`, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
				},
				body: JSON.stringify({
					channelId: name,
					senderId: auth?.user?.id,
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
		auth?.socket?.on('kicked', (channel: string) => {
			error('You have been kicked from ' + channel);
			if (name === channel) {
				navigate('/chat/channels');
			}
		});
	
		auth?.socket?.on('banned', (channel: string) => {
			error('You have been banned from ' + channel);
			if (name === channel) {
				navigate('/chat/channels');
			}
		});

		return () => {
			auth?.socket?.off("typing");
			auth?.socket?.off('kicked');
			auth?.socket?.off('banned');
		}
	}, []);

	return (
		<>
			<TopBar channel={name} />
			<MessageDisplay key={name} channel={name ? name : ''} />
			{typing !== '' && 
				<div className="typingIndicator">{typing}</div>
			}
			<div className='messageInput'>
				<textarea
					value={message}
					onKeyDown={handleKeyDown}
					placeholder={'Send message to ' + name}
					onChange={onTyping}
				/>
			</div>
		</>
	);
}