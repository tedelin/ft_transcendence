import { useChatDispatch, useChat } from './ChatContext';
import { UserChannel } from './UserChannel';
import '../styles/chat.css';
import { NavLink } from 'react-router-dom';

export function SideBar() {
	const chat = useChat();

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