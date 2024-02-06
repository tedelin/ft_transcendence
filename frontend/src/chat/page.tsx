import { SideBar } from './SideBar';
import { Outlet } from 'react-router-dom';
import '../styles/chat.css';

export default function ChatPage() {
	return (
		<div className="chat">
			<SideBar />
			<div className='chatArea'>
				<Outlet />
			</div>
		</div>
	);
}
