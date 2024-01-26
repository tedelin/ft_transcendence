import { useState, useContext } from 'react';
import { AuthContext } from '../components/AuthProvider';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { user, setUser } = useContext(AuthContext);

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:3001/auth/signup', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body : `name=${username}&password=${password}`
      });
	  const data = await response.json();
	  console.log(response);
	  console.log(data.id, data.username);
      localStorage.setItem('jwtToken', data.access_token);
	  // setUser({username : data.username, id : data.id});
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire: ", error);
    }
  };

  return (
    <div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nom d'utilisateur"/>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
          />
          <div className='spacer'></div>
          <button type="submit">Connexion</button>
        </form>
    </div>
  );
}