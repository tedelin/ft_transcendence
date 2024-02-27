import { createContext, useContext } from 'react';
import { io } from 'socket.io-client';

const token = localStorage.getItem('jwt');
export const socket = io(import.meta.env.VITE_BACKEND_URL!, {
	query: { token },
});

export const SocketContext = createContext(socket);


export function useSocket() {
	return useContext(SocketContext);
}