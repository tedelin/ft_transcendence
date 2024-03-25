import { useState, useEffect, useRef } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from "../components/AuthProvider";
import { useToast } from '../utils/hooks/useToast';
import { PrivateMessage } from '../utils/types';
import { getAvatar } from '../utils/utils';
import '../styles/chat.css';
import { useNavigate } from 'react-router';

export function PrivateMessagesDisplay({ conversationId }: { conversationId: number }) {
    const [receivedMessages, setReceivedMessages] = useState<PrivateMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [offset, setOffset] = useState(0);
	const messageContainer = useRef<HTMLDivElement>(null);
	const prevScrollHeightRef = useRef<number | null>(null);
	const {error} = useToast();
	const navigate = useNavigate();
    const auth = useAuth();

    async function fetchPrivateMessages() {
        try {
			setIsLoading(true);
            const response = await fetchUrl(`/private-messages/${conversationId}?offset=${offset}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
                },
            });
            setReceivedMessages(prevMessages => [...response, ...prevMessages]);
			setOffset(prevOffset => prevOffset + response.length);
			prevScrollHeightRef.current = messageContainer.current?.scrollHeight || null;
        } catch (err:any) {
            error(err.message);
        } finally {
			setIsLoading(false);
		}
    };

	function handleScroll() {
		if (messageContainer.current) {
			const { scrollTop } = messageContainer.current;
			if (scrollTop === 0 && !isLoading) {
				fetchPrivateMessages();
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

    useEffect(() => {
        auth?.socket?.on('private-message', (message: PrivateMessage) => {
            if (message.sender.id !== conversationId && message.sender.id !== auth?.user?.id) {
                return;
            }
            setReceivedMessages(prevMessages => [...prevMessages, message]);
			if (messageContainer.current) {
				messageContainer.current.scrollTop = messageContainer.current.scrollHeight;
			}
        });
        
		if (conversationId)
        	fetchPrivateMessages();

        return () => {
            setReceivedMessages([]);
            auth?.socket?.off('private-message');
        };
    }, []);

    return (
		<div ref={messageContainer} className='messageContainer'>
			{receivedMessages.map((msg: PrivateMessage) => (
				<div
					key={msg.id}
					className={msg.sender.id === auth?.user?.id ? 'bubble-right' : 'bubble-left'}
				>
					<div className="sender"
					>
						<img
							onClick={() => navigate('/profil/' + msg.sender.id)}  
							src={getAvatar(msg.sender.avatar)} alt="User Avatar"></img>
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
