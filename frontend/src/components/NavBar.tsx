import {useEffect} from 'react';
import { useAuth } from './AuthProvider';
import { NavLink } from 'react-router-dom'
import '../styles/navbar.css';


export function NavBar() {
    const auth = useAuth();
	const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
	const filePath = auth?.user?.avatar;
	const fileName = filePath?.split('/').pop();
	const avatarUrl = API_BASE_URL + "/users/avatars/" + fileName;

	console.log()
    function logout() {
        auth?.signout();
    }

	useEffect(() => {}, [auth?.user])
    return (
		<>
			<div className="navBar">
				<div className="navItems">
					<NavLink className="navBarItem" to="/">Home</NavLink>
					<NavLink className="navBarItem" to="/chat">Chat</NavLink>
					<NavLink className="navBarItem" to="/game">Game</NavLink>
				</div>
				{auth?.user?.username && <div className="navUser">
					<img src={avatarUrl} alt="User Avatar" />
					<NavLink to="/Settings">{auth ? auth.user.username : "undefined"}</NavLink>
					<button onClick={logout}>Logout</button>
				</div>}
			</div>
		</>
    )
}