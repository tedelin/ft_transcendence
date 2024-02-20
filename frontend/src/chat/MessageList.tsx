import React from 'react';

// Type pour les props du composant
type Message = {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
};

type Props = {
  messages: Message[];
  currentUserId: number; // Pour distinguer les messages envoyés des messages reçus
};

export const MessageList: React.FC<Props> = ({ messages, currentUserId }) => {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message.id} className={`message-item ${message.senderId === currentUserId ? 'sent' : 'received'}`}>
          <p>{message.content}</p>
          <span>{message.timestamp}</span>
        </div>
      ))}
    </div>
  );
};
