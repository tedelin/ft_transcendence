import { useState} from "react";
import {MessageDisplay} from './MessageDisplay';
import { useChat } from './ChatContext';
import { useAuth } from "../components/AuthProvider";
import '../styles/chat.css';
import { useParams } from "react-router-dom";
import { fetchUrl } from "../fetch";

function TopBar() {
	const chat = useChat();

	return (
		<div className="topBarChat">
			<img  className="smallAvatar" src="https://imgs.search.brave.com/MWlI8P3aJROiUDO9A-LqFyca9kSRIxOtCg_Vf1xd9BA/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc" alt="User Avatar"></img>
			<span className='spanMargin'>
				{chat.channelTo?.name}
			</span>
		</div>
	);
}


export function ChatChannel() {
	const [message, setMessage] = useState('');
	const {name} = useParams();
	const auth = useAuth();

	function sendChannelMessage() {
		auth?.socket?.emit('channel-message', {channelId: name, senderId: auth?.user?.id, content: message})
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
    
	return (
		<>
			{/* <TopBar/> */}
			<MessageDisplay key={name} channel={name}/>
			<div className='messageInput'>
				<textarea 
					value={message} 
					onKeyDown={handleKeyDown} 
					placeholder={'Send message to ' + name} 
					onChange={e => setMessage(e.target.value)} 
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