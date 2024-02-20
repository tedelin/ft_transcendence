import React, { useState, useEffect } from 'react';
import { fetchConversations, fetchMessages, sendMessage } from '../services/privateMessagesService';
import { ConversationList } from './ConversationList';
import { MessageList } from './MessageList';
import { SendMessageForm } from './SendMessageForm';

export function PrivateMessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [receiverId, setReceiverId] = useState('');

  useEffect(() => {
    fetchConversations().then(setConversations);
  }, []);

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
    fetchMessages(conversation.id).then(setMessages);
  };
  const handleSendMessage = async (content) => {
    try {
      if (receiverId) {
        await sendMessage(parseInt(receiverId), content);
        // Gérer la réussite de l'envoi du message
        console.log("Message sent successfully");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        placeholder="Enter receiver ID"
      />
      <input
        type="text"
        value={newMessageContent}
        onChange={(e) => setNewMessageContent(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={() => handleSendMessage(newMessageContent)}>Send Message</button>
      <ConversationList 
        conversations={conversations} 
        onSelectConversation={handleSelectConversation} 
      />
      {currentConversation && (
        <>
          <MessageList messages={messages} />
          <SendMessageForm onSendMessage={(content) => handleSendMessage(content)} />
        </>
      )}
    </div>
  );
}
