import React from 'react';

// Type pour les props du composant
type Conversation = {
  id: number;
  title: string;
  lastMessage: string;
  lastMessageTime: string;
};

type Props = {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
};

export const ConversationList: React.FC<Props> = ({ conversations, onSelectConversation }) => {
  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <div key={conversation.id} onClick={() => onSelectConversation(conversation)} className="conversation-item">
          <h3>{conversation.title}</h3>
          <p>{conversation.lastMessage}</p>
          <span>{conversation.lastMessageTime}</span>
        </div>
      ))}
    </div>
  );
};
