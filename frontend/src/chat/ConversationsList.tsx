import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Conversation {
  id: number;
  username: string;
}

const ConversationsList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
	const fetchConversations = async () => {
	  const token = localStorage.getItem('jwtToken'); // Obtenez le token du localStorage
	  if (token) {
		try {
		  const response = await axios.get('http://localhost:3001/private-messages/conversations', {
			headers: {
			  Authorization: `Bearer ${token}`, // Ajoutez le token à la requête
			},
		  });
		  console.log("Conversations:", response.data);
		setConversations(response.data);
		} catch (error) {
		  console.error("Il y a eu un problème pour récupérer les conversations", error);
		}
	  } else {
		console.error("Token JWT non trouvé");
	  }
	};
  
	fetchConversations();
  }, []);

  return (
    <div>
      <h2>Mes Conversations</h2>
      <ul>
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <Link to={`/conversations/${conversation.id}`}>{conversation.username}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConversationsList;
