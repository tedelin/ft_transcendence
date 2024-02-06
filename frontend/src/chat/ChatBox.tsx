import { useEffect, useState } from "react";
import { MessageDisplay } from './MessageDisplay';
import { useAuth } from "../components/AuthProvider";
import { useParams } from "react-router-dom";
import '../styles/chat.css';

// function TopBar() {

// 	return (
// 		<div className="topBarChat">
// 			<img className="smallAvatar" src="https://imgs.search.brave.com/MWlI8P3aJROiUDO9A-LqFyca9kSRIxOtCg_Vf1xd9BA/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc" alt="User Avatar"></img>
// 			<span className='spanMargin'>
// 				{chat.channelTo?.name}
// 			</span>
// 		</div>
// 	);
// }


export function ChatBox() {
	const [message, setMessage] = useState('');
	const [typing, setTyping] = useState('');
	const { name } = useParams();
	const auth = useAuth();

	// Event listener for message
	function onTyping(e: any) {
		auth?.socket?.emit("typing", { username: auth?.user?.username, roomId: name });
		setMessage(e.target.value);
	}

	function sendChannelMessage() {
		auth?.socket?.emit('channel-message', { channelId: name, senderId: auth?.user?.id, content: message })
		setMessage('');
		// else if (chat.dmTo) {
		// 	auth?.socket?.emit('private-message', {senderId: auth?.user?.id, receiverId: chat.dmTo.receiverId, content: message})
		// 	setMessage('');
		// }
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
			{/* <TopBar/> */}
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