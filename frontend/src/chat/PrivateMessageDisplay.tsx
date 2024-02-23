import { useState, useEffect, useRef } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from "../components/AuthProvider";
import '../styles/chat.css';

export function PrivateMessagesDisplay({ conversationId }) {
    const [receivedMessages, setReceivedMessages] = useState([]);
    const messageContainer = useRef(null);
    const auth = useAuth();


	async function fetchUserInfo(userId) {
		try {
			const token = localStorage.getItem('jwtToken');
			const response = await fetchUrl(`/users/${userId}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});
			return response; // Supposons que cela renvoie { id: userId, username: "Nom d'utilisateur", avatar: "URL de l'avatar" }
		} catch (error) {
			console.error('Error fetching user info:', error);
			return null;
		}
	}

    async function fetchPrivateMessages() {
        try {
            const token = localStorage.getItem('jwtToken');
			console.log(conversationId)
			console.log(token)
            const response = await fetchUrl(`/private-messages?otherUserId=${conversationId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
			console.log(response)
            setReceivedMessages(response);
        } catch (error) {
            console.error('Error fetching private messages:', error);
        }
    };

    function scrollToBottom() {
        if (messageContainer.current) {
            messageContainer.current.scrollTop = messageContainer.current.scrollHeight;
        }
    }

    useEffect(() => {
        auth?.socket?.on('private-message', (message) => {
            // Assurez-vous que le message appartient à la conversation actuelle
            if (message.conversationId !== conversationId) {
                return;
            }
            setReceivedMessages(prevMessages => [...prevMessages, message]);
        });
        
        // Fetch initial messages
        fetchPrivateMessages();

        return () => {
            setReceivedMessages([]);
            auth?.socket?.off('private-message');
        };
    // Assurez-vous d'inclure `conversationId` dans le tableau des dépendances pour recharger les messages lorsqu'il change.
    }, [conversationId, auth?.socket]);

    useEffect(() => {
        scrollToBottom();
    }, [receivedMessages]);

    return (
        <div ref={messageContainer} className='messageContainer'>
            {receivedMessages.map((msg, index) => (
                <div className={msg.senderId === auth?.user?.id ? 'bubble-right' : 'bubble-left'} key={index}>
                    <div className="sender">
                        <img src={msg.sender?.avatar || "https://www.w3schools.com/howto/img_avatar.png"} alt="User Avatar" />
                        <div className="senderName">
                            {msg.sender?.username || "Unknown"}
                        </div>
                    </div>
                    <div className="message">{msg.content}</div>
                    <div className="timestamp">{new Date(msg.timestamp).toLocaleString()}</div>
                </div>
            ))}
        </div>
    );
}

export default PrivateMessagesDisplay;
