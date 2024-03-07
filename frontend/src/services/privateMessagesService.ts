const API_URL = 'http://localhost:3000/private-messages'; // Ajustez selon votre configuration

export async function createConversation(receiverId: number) {
  const response = await fetch(`http://localhost:3000/private-messages/conversations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ receiverId }),
  });
  if (!response.ok) {
    throw new Error('Failed to create conversation');
  }
  return response.json();
}

export async function fetchConversations() {
  const response = await fetch(`${API_URL}/conversations`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }
  return response.json();
}

export async function fetchMessages(conversationId) {
  const response = await fetch(`${API_URL}/${conversationId}/messages`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
}

export async function sendMessage(receiverId: number, content: string) {
  const token = localStorage.getItem('jwtToken');
  const response = await fetch('http://localhost:3001/private-messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ receiverId, content }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}
