import { useAuth } from './AuthProvider';
import { NavLink } from 'react-router-dom'
import '../styles/navbar.css';


export function NavBar() {
    const auth = useAuth();

    function logout() {
        auth?.signout();
    }
    return (
		<>
			<div className="navBar">
				<div className="navItems">
					<NavLink className="material-symbols-outlined" to={`/profil/${auth?.user?.id}`} >home</NavLink>
					<NavLink className="material-symbols-outlined" to="/friends">group</NavLink>
					<NavLink className="material-symbols-outlined" to="/chat/channels">forum</NavLink>
					<NavLink className="material-symbols-outlined" to="/game">sports_volleyball</NavLink>
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