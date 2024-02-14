import React, { useState, createContext, useContext, useEffect } from 'react';
import { fetchUrl } from '../fetch';
import { io } from 'socket.io-client';


type UserType = {
	id: string;
	username: string;
	avatar: string;
	useTwoFA: boolean;
};

interface AuthContextType {
	user: UserType | null;
	loading: boolean;
	socket: any;
	signin: (username: string, password: string) => Promise<void>;
	signup: (username: string, password: string) => Promise<void>;
	signout: (callback: VoidFunction) => void;
	verifyTotp: (username: string, password: string, totp: string) => void;
	getTwoFaStatus: (username: string, password: string) => void;
	handleAuth : (token : string) => Promise<void>;
}


export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserType | null>(null);
	const [loading, setLoading] = useState(true);
	const [socket, setSocket] = useState<any>(null);

	async function handleAuth(token: string): Promise<void> {
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
		} catch (error) {
			setLoading(false);
			throw error;
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
			localStorage.setItem('jwtToken', token);
			await handleAuth(token);
		} catch (error) {
			throw error;
		}
	}

	async function getTwoFaStatus(username: string, password: string) {
		try {
			const response = await fetchUrl('/auth/twoFaStatus', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});
			const { status } = response;
			return status;
		} catch (error) {
			throw error;
		}
	}


	async function verifyTotp(username: string, password: string, totp: string): Promise<void> {
		try {
			const response = await fetchUrl('/auth/validate-2fa', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password, totp }),
			});
			if (response.validated == true)
				console.log("OK !")
			else
				throw "NO !"
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
			localStorage.setItem('jwtToken', token);
			await handleAuth(token);
		} catch (error) {
			throw error;
		}
	}

	function signout(): void {
		localStorage.removeItem('jwtToken');
		setUser(null);
	}

	async function initAuth() {
		const token = localStorage.getItem('jwtToken');
		if (token) {
			try {
				await handleAuth(token);
				setLoading(false);
			} catch (error) {
				setLoading(false);
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

	let value = { user, loading, socket, signin, signup, signout, getTwoFaStatus, verifyTotp, handleAuth};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}