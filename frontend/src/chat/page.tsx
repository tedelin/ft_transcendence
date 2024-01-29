import { ChatProvider } from './ChatContext';
import { ChatChannel } from './ChatChannel';
import { Channels } from './Channels';
import { Friends } from './Friends';
import { SideBar } from './SideBar';
import '../styles/chat.css';

function Chat() {
	return (
		<div className="chat">
            {/* <SideBar /> */}
            <Channels />
            <ChatChannel />
            <Friends />
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
