import React, { createContext, useContext, useState, useEffect } from 'react';

interface ErrorContextType {
	error: string;
	setError: (error: string) => void;
}

export const ErrorContext = createContext<ErrorContextType>({ error: '', setError: () => {} });

export function ErrorProvider({ children }: { children: React.ReactNode }) {
	const [error, setError] = useState('');

	useEffect(() => {
		const timeout = setTimeout(() => {
			setError('');
		}, 5000);

		return () => clearTimeout(timeout);
	}, [error]);

	const value = { error, setError };

	return (
		<ErrorContext.Provider value={value}>
			{children}
		</ErrorContext.Provider>
	);
}

export function useError() {
	return useContext(ErrorContext);
}