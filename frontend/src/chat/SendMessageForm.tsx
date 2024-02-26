import React, { useState } from 'react';

type Props = {
  onSendMessage: (content: string) => void;
};

export const SendMessageForm: React.FC<Props> = ({ onSendMessage }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="send-message-form">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a message..."
      />
      <button type="submit">Send</button>
    </form>
  );
};
