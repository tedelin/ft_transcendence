import {useEffect} from 'react';
import { useAuth } from './AuthProvider';
import { NavLink, Navigate } from 'react-router-dom'
import '../styles/navbar.css';
import { useGame } from './GameProvider';


export function NavBar() {
    const auth = useAuth();
	const game = useGame();
	const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
	const filePath = auth?.user?.avatar;
	const fileName = filePath?.split('/').pop();
	const avatarUrl = API_BASE_URL + "/users/avatars/" + fileName;

    function logout() {
        auth?.signout();
    }

	// function goToGame() {
	// }

	useEffect(() => {}, [auth?.user])
    return (
		<>
			<div className="navBar">
				<div className="navItems">
					<NavLink className="material-symbols-outlined" to="/">home</NavLink>
					<NavLink className="material-symbols-outlined" to="/chat/friends">group</NavLink>
					<NavLink className="material-symbols-outlined" to="/chat/channels">forum</NavLink>
					<NavLink className="material-symbols-outlined" to="/game">sports_volleyball</NavLink>
					{/* <NavLink className="material-symbols-outlined" to="/login">Login</NavLink> */}
				</div>
				<div className="navUser">
					<NavLink className="material-symbols-outlined" to="/Settings">settings</NavLink>
					<span onClick={logout} className="material-symbols-outlined">
						logout
					</span>
				</div>
			</div>
		</>
    )
}