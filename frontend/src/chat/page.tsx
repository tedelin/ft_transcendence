import { SideBar } from './SideBar';
import { Outlet, useNavigate } from 'react-router-dom';
import '../styles/chat.css';
import { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useError } from '../components/ErrorProvider';

export default function ChatPage() {
	const auth = useAuth();
	const navigate = useNavigate();
	const err = useError();

	useEffect(() => {
		auth?.socket?.on('kicked', (room) => {
			err.setError('You have been kicked from ' + room);
			navigate('/chat/channels');
		});

		auth?.socket?.on('banned', (room) => {
			err.setError('You have been banned from ' + room);
			navigate('/chat/channels');
		});
	}, []);


	return (
		<div className="chat">
			<SideBar />
			<div className='chatArea'>
				<Outlet />
			</div>
		</div>
	);
}
