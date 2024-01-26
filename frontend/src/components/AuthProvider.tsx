import React, { useState, createContext, useContext, useEffect } from 'react';
import { fetchUrl } from '../fetch';


type UserType = {
  id: string;
  username: string;
  avatar: string;
  useTwoFa: boolean;
};

interface AuthContextType {
	user: UserType | null;
	loading: boolean;
	signin: (username: string, password: string, callback: VoidFunction) => Promise<void>;
	signup: (username: string, password: string, callback: VoidFunction) => Promise<void>;
	signout: (callback: VoidFunction) => void;
  }

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	let [user, setUser] = useState<UserType | null>(null);
	let [loading, setLoading] = useState(true);

	const handleAuth = async (token: string, callback: VoidFunction) => {
	  try {
		localStorage.setItem('jwtToken', token);
		const response = await fetchUrl('/users/me', {
		  method: 'GET',
		  headers: {
			Authorization: `Bearer ${token}`,
		  },
		});
		setUser(response);
		callback();
	  } catch (error) {
		console.error('Error during handleAuth:', error);
	  }
	};
  
	let signin = async (username: string, password: string, callback: VoidFunction) => {
	  try {
		const response = await fetchUrl('/auth/signin', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({ username, password }),
		});
		const token = response.access_token;
		handleAuth(token, callback);
	  } catch (error) {
		console.error('Error during signin:', error);
	  }
	};
  
	let signup = async (username: string, password: string, callback: VoidFunction) => {
	  try {
		const response = await fetchUrl('/auth/signup', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({ username, password }),
		});
		const token = response.access_token;
		handleAuth(token, callback);
	  } catch (error) {
		console.error('Error during signup:', error);
	  }
	};
  
	let signout = (callback: VoidFunction) => {
	  localStorage.removeItem('jwtToken');
	  setUser(null);
	  callback();
	};

	useEffect(() => {
		const token = localStorage.getItem('jwtToken');
		if (token) {
			handleAuth(token, () => {
				setLoading(false);
			});
		} else {
			setLoading(false);
		}
	}, []);
  
	let value = { user, loading, signin, signup, signout };
  
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

export function useUser() {
	return useContext(AuthContext);
};