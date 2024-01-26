import React, { useState, useEffect, useRef } from 'react';
import socket from '../socket';


export function UserList() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
  
	useEffect(() => {
	  const handleConnectedUsers = (users) => {
		setUsers(users);
		setLoading(false);
	  };
  
	  socket.on('connected-users', handleConnectedUsers);

	  socket.emit('get-connected-users');
  
	  return () => {
		socket.off('connected-users', handleConnectedUsers);
	  };
	}, []);
  
	return (
	  <div>
		<h2>User List</h2>
		{loading ? (
		  <p>Loading user list...</p>
		) : (
		  <ul>
			{users.map((user, index) => (
			  <li key={index}>{user}</li>
			))}
		  </ul>
		)}
	  </div>
	);
}