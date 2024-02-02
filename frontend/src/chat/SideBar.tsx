import { UserChannel } from './UserChannel';
import { NavLink } from 'react-router-dom';
import '../styles/chat.css';

export function SideBar() {
	return (
		<div className='sideMenu'>
			<NavLink className="sideMenuItem" to="/chat/channels">
				<div className="sideMenuTitle">
					<span className="material-symbols-outlined">
						forum
					</span>
					<span>
						Channels
					</span>
				</div>
			</NavLink>
			<NavLink className="sideMenuItem" to="/chat/friends">
				<div className="sideMenuTitle">
					<span className="material-symbols-outlined">
						group
					</span>
					<span>
						Friends
					</span>
				</div>
			</NavLink>
			<div className="sideBarChat">
				<UserChannel />
			</div>
		</div>
	);
}