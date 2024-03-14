import { Outlet } from 'react-router-dom';
import { RightBar } from './RightBar';
import '../styles/chat.css';

export default function ChatPage() {
	return (
		<>
			<div className="flexRow">
				<Outlet />
			</div>
			<RightBar />
		</>
	);
}
