import { ChatProvider } from './ChatContext';
import { ChatChannel } from './ChatChannel';
import { Channels } from './Channels';
import { Friends } from './Friends';
import { SideBar } from './SideBar';
import { Outlet } from 'react-router-dom';
import '../styles/chat.css';

function Chat() {
	return (
		<div className="chat">
			<SideBar />
			<div className='chatArea'>
				<Outlet />
			</div>
		</div>
	)
}

export default function ChatPage() {
	return (
		<ChatProvider>
			<Chat />
		</ChatProvider>
	);
}
