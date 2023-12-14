"use client";

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const WebSocketClient = () => {
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('ws://localhost:3001');

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    newSocket.on('message', (data) => {
      setMessage(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (socket) {
      socket.emit('message', 'Hello world');
    }
  };

  return (
    <div>
      <button onClick={sendMessage}>Send Message</button>
      <p>Received message: {message}</p>
    </div>
  );
};

export default WebSocketClient;
