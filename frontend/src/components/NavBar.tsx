import { useUser } from './AuthProvider';
import { NavLink } from 'react-router-dom'
import '../styles/navbar.css';


export function NavBar() {
    const auth = useUser();

    function logout() {
        auth?.signout(() => {});
    }

    return (
		<>
			<div className="navBar">
				<div className="navItems">
					<NavLink className="navBarItem" to="/">Home</NavLink>
					<NavLink className="navBarItem" to="/chat">Chat</NavLink>
					<NavLink className="navBarItem" to="/game">Game</NavLink>
				</div>
				{auth?.user?.username && <div className="navUser">
					<img src="https://www.w3schools.com/howto/img_avatar.png" alt="User Avatar" />
					<span>{auth ? auth.user.username : "undefined"}</span>
					<button onClick={logout}>Logout</button>
				</div>}
			</div>
		</>
    )
}