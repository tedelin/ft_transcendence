import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Message {
  senderId: number; // Identifiant de l'expéditeur du message
  content: string;
  createdAt: string;
}

const Conversation: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { conversationId } = useParams<{ conversationId: string }>();
  const currentUserId = parseInt(localStorage.getItem('userId') || '0'); // Remplacez par la manière dont vous stockez/récupérez l'ID de l'utilisateur connecté

  useEffect(() => {
    axios.get(`http://localhost:3001/private-messages?otherUserId=${conversationId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    })
    .then(response => {
      console.log("Messages:", response.data);
      setMessages(response.data);
    })
    .catch(error => {
      console.error("Il y a eu un problème pour récupérer les messages", error);
    });
  }, [conversationId]);

  return (
    <div>
      <h2>Conversation</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index} style={{ textAlign: message.senderId === currentUserId ? 'left' : 'right' }}>
            {message.content} - <small>{message.createdAt}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Conversation;


/* EN CHANTIER - AVEC PRIVATEMESSAGEDISPLAY*/


// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { useAuth } from "../components/AuthProvider";
// import { useError } from "../components/ErrorProvider";
// import { fetchUrl } from "../fetch";
// import '../styles/chat.css';

// // Supposition que MessageDisplay est déjà adapté pour l'affichage conditionnel des messages
// import { PrivateMessagesDisplay } from './PrivateMessageDisplay';

// function TopBar({ channel }) {
//   // Logique pour TopBar reste inchangée
// }

// export function Conversation() {
// 	const [message, setMessage] = useState('');
// 	const [typing, setTyping] = useState('');
// 	const { name } = useParams();
// 	// const receiver = useParams<{ conversationId: string }>();
// 	const auth = useAuth();
// 	const err = useError();
// 	const { conversationId } = useParams<{ conversationId: string }>();

// 	function onTyping(e: any) {
// 		auth?.socket?.emit("typing", { username: auth?.user?.username, roomId: name });
// 		setMessage(e.target.value);
// 	}

// 	async function sendChannelMessage() {
// 		try {
// 			await fetchUrl("/private-messages", {
// 				method: "POST",
// 				headers: {
// 					'Content-Type': 'application/json',
// 				},
// 				body: JSON.stringify({
// 					senderId: auth?.user?.id, 
// 					receiverId: conversationId,
// 					content: message 
// 				}),
// 			});
// 			setMessage('');
// 		} catch (error: any) {
// 			err.setError(error.message);
// 		}
// 	}

// 	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
// 		if (e.key == 'Enter')
// 			e.preventDefault();
// 		if (e.key === 'Enter' && !e.shiftKey && message.length > 0) {
// 			sendChannelMessage();
// 		}
// 	};

// 	useEffect(() => {
// 		auth?.socket?.on("typing", (username: string) => {
// 			if (username === auth?.user?.username)
// 				return;
// 			setTyping(`${username} is typing ...`);
// 			setTimeout(() => {
// 				setTyping('');
// 			}, 3000);
// 		});
// 	}, [auth?.socket, auth?.user?.username])

// 	return (
// 		<>
// 			{/* <TopBar channel={name}/> */}
// 			<PrivateMessagesDisplay conversationId={conversationId}/>
// 			<div className="typingIndicator">{typing}</div>
// 			<div className='messageInput'>
// 				<textarea
// 					value={message}
// 					onKeyDown={handleKeyDown}
// 					placeholder={'Send message to ' + name}
// 					onChange={onTyping}
// 				/>
// 				<button className='inviteBtn'>
// 					<span className="material-symbols-outlined">
// 						stadia_controller
// 					</span>
// 				</button>
// 				<button
// 					className='sendMessageBtn'
// 					disabled={message.length === 0}
// 					onClick={sendChannelMessage}
// 				>
// 					<span className="material-symbols-outlined">
// 						send
// 					</span>
// 				</button>
// 			</div>
// 		</>
// 	);
// }

// export default Conversation;
