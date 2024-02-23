import React, { useState } from 'react';

type Props = {
  onCreateConversation: (receiverId: number) => void;
};

export const NewConversationForm: React.FC<Props> = ({ onCreateConversation }) => {
  const [receiverId, setReceiverId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateConversation(Number(receiverId));
    setReceiverId('');
  };

  return (
    <form onSubmit={handleSubmit} className="new-conversation-form">
      <input
        type="number"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        placeholder="Enter user ID to chat with"
        required
      />
      <button type="submit">Start Conversation</button>
    </form>
  );
};
