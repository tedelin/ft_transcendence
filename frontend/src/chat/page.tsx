import { SideBar } from './SideBar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useToast } from '../utils/hooks/useToast';
import '../styles/chat.css';

export default function ChatPage() {
	const auth = useAuth();
	const navigate = useNavigate();
	const {error} = useToast();

	useEffect(() => {
		auth?.socket?.on('kicked', (room) => {
			error('You have been kicked from ' + room);
			navigate('/chat/channels');
		});

		auth?.socket?.on('banned', (room) => {
			error('You have been banned from ' + room);
			navigate('/chat/channels');
		});
	}, []);


	return (
		<div className="chat">
			{/* <SideBar /> */}
			<div className='chatArea'>
				<Outlet />
			</div>
		</div>
	);
}
