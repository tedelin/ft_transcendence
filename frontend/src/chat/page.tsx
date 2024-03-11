import { SideBar } from './SideBar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useToast } from '../utils/hooks/useToast';
import '../styles/chat.css';
import { RightBar } from './RightBar';

export default function ChatPage() {
	const auth = useAuth();
	const navigate = useNavigate();
	const urlParams = new URLSearchParams(window.location.search);
	const {error} = useToast();

	useEffect(() => {
		auth?.socket?.on('kicked', (channel: string) => {
			error('You have been kicked from ' + channel);
			if (urlParams.get('channels') === channel) {
				navigate('/chat/channels');
			}
		});

		auth?.socket?.on('banned', (channel: string) => {
			error('You have been banned from ' + channel);
			if (urlParams.get('channels') === channel) {
				navigate('/chat/channels');
			}
		});
	}, []);


	return (
		<>
			<div className="flexRow">
				<Outlet />
			</div>
			<RightBar />
		</>
	);
}
