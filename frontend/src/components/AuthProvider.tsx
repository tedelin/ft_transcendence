import React, { useState, createContext, useEffect, useContext } from 'react';
import jwt from 'jsonwebtoken';


type UserType = {
  id: string;
  username: string;
};


interface AuthContextType {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}

interface AuthProviderProps {
	children: React.ReactNode;
}


export const AuthContext = createContext<UserType | null>(null);



export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState([]);

  useEffect(() => {
	const storedToken = localStorage.getItem('jwtToken');
	const getUser = async (storedToken : any) => {
		try {
		  const response = await fetch('http://127.0.0.1:3001/users/me', { 
			method: 'GET',
			headers: {
			  'Content-Type': 'application/x-www-form-urlencoded',
			  'Authorization': `Bearer ${storedToken}`,
			},
		  });
		  const data = await response.json();
		  setUser(data);
		}
		catch (error) {
		  console.error("Erreur lors de l'envoi du formulaire: ", error);
		}
	}
	if (storedToken)
    	getUser(storedToken);
    // if (!decodedToken) throw new Error('Invalid token');
    // const decodedUser: UserType = {
    //   id: decodedToken.sub,
    //   username: decodedToken.userName,
    // };
    // setUser(decodedUser);


        // ----------------------MOI----------------------


        // const decodedToken = jwt.decode(storedToken);
        // console.log('decodedToken type :', typeof(decodedToken))
        // console.log('decodedToken :', decodedToken)
        
        // if (!decodedToken) throw new Error('Invalid token');
        // const decodedUser: UserType = {
        //   id: decodedToken.sub,
        //   username: decodedToken.userName,
        // };
        // setUser(decodedUser);

        // --------------------------------------------


        // const decodedToken = jwt.decode(storedToken);
        // console.log('decodedToken type :', typeof(decodedToken))
        // console.log('decodedToken :', decodedToken)
        
        // if (!decodedToken) throw new Error('Invalid token');
        // const decodedUser: UserType = {
        //   id: decodedToken.sub,
        //   username: decodedToken.userName,
        // };
        // setUser(decodedUser);
    }, []);

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
};

export function useUser() {
	return useContext(AuthContext);
};