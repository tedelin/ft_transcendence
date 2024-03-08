import { useState, useEffect, useRef } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from "../components/AuthProvider";
import { useToast } from '../utils/hooks/useToast';
import { PrivateMessage } from '../utils/types';
import { getAvatar } from '../utils/utils';
import '../styles/chat.css';

export function PrivateMessagesDisplay({ conversationId }: { conversationId: number }) {
    const [receivedMessages, setReceivedMessages] = useState<PrivateMessage[]>([]);
    const messageContainer = useRef(null);
	const {error} = useToast();
    const auth = useAuth();

    async function fetchPrivateMessages() {
        try {
            const response = await fetchUrl(`/private-messages/${conversationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                },
            });
            setReceivedMessages(response);
        } catch (err:any) {
            error(err.message);
        }
    };

    function scrollToBottom() {
        if (messageContainer.current) {
            messageContainer.current.scrollTop = messageContainer.current.scrollHeight;
        }
    }

    useEffect(() => {
        auth?.socket?.on('private-message', (message: PrivateMessage) => {
            if (message.sender.id !== conversationId && message.sender.id !== auth?.user?.id) {
                return;
            }
            setReceivedMessages(prevMessages => [...prevMessages, message]);
        });
        
		if (conversationId)
        	fetchPrivateMessages();

        return () => {
            setReceivedMessages([]);
            auth?.socket?.off('private-message');
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [receivedMessages]);

    return (
        <div ref={messageContainer} className='messageContainer'>
            {receivedMessages.map((msg: PrivateMessage) => (
				<div
					key={msg.id}
					className={msg.sender.id === auth?.user?.id ? 'bubble-right' : 'bubble-left'}
				>
					<div className="sender"
					>
						<img src={getAvatar(msg.sender.avatar)} alt="User Avatar"></img>
						<div className="senderName">
							{msg.sender?.username}
						</div>
					</div>
					<div className="message">
						{msg.content}
					</div>
					<div className="timestamp">
						{new Date(msg.timestamp).toLocaleString()}
					</div>
			 </div>
            ))}
        </div>
    );
}
