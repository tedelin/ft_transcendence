import React, { useState, createContext, useContext, useEffect } from 'react';
import { fetchUrl } from '../fetch';
import { Socket, io } from 'socket.io-client';
import { User } from '../utils/types';
import { useToast } from '../utils/hooks/useToast';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	socket: Socket | null;
	signin: (username: string, password: string) => Promise<void>;
	signup: (username: string, password: string) => Promise<void>;
	fetchUser: (token: string) => Promise<void>;
	signout: () => void;
}


export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [socket, setSocket] = useState<Socket | null>(null);
	const {error} = useToast();

	async function fetchUser(token: string): Promise<void> {
		try {
			const response = await fetchUrl('/users/me', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setUser(response);
			setSocket(io(import.meta.env.VITE_BACKEND_URL, {
				query: { token },
			}));
			localStorage.setItem('jwtToken', token);
		} catch (error) {
			throw error;
		} finally {
			setLoading(false);
		}
	}

	async function signin(username: string, password: string): Promise<void> {
		try {
			const response = await fetchUrl('/auth/signin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});
			const token = response.access_token;
			await fetchUser(token);
		} catch (error) {
			throw error;
		}
	}

	async function signup(username: string, password: string): Promise<void> {
		try {
			const response = await fetchUrl('/auth/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});
			const token = response.access_token;
			await fetchUser(token);
		} catch (error) {
			throw error;
		}
	}

	function signout(): void {
		localStorage.removeItem('jwtToken');
		setUser(null);
		socket?.disconnect();
	}

	async function initAuth() {
		const token = localStorage.getItem('jwtToken');
		if (token) {
			try {
				await fetchUser(token);
			} catch (error) {
				localStorage.removeItem('jwtToken');
			}
		} else {
			setLoading(false);
		}
	};

	useEffect(() => {
		initAuth();
	
		return () => {
			socket?.disconnect();
		};
	}, []);

	useEffect(() => {
		socket?.on('duplicate-login', () => {
			signout();
			error('You have been disconnected')
		})

		return () => {
			socket?.off('duplicate-login');
		}
	}, [socket]);


	let value = { user, loading, socket, signin, signup, signout, fetchUser};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}