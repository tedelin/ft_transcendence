import { useChatDispatch, useChat } from './ChatContext';
import { UserChannel } from './UserChannel';
import '../styles/chat.css';

export function SideBar() {
    const dispatch = useChatDispatch();
    const chat = useChat();
	
    return (
		<>
			{chat.sideBar && (
				<div className='sideMenu'>
						<div className='sideMenuItem' onClick={() => {dispatch({ type: 'channel' })}}>
							<div className={`sideMenuTitle${chat.active === 'channels' ? "Selected" : ""}`}>
								<span className="material-symbols-outlined">
									forum
								</span>
								<span>
									Channels
								</span>
							</div>
						</div>
						<div className='sideMenuItem' onClick={() => {dispatch({ type: 'friends' })}}>
							<div className={`sideMenuTitle${chat.active === 'friends' ? "Selected" : ""}`}>
								<span className="material-symbols-outlined">
									group
								</span>
								<span>
									Friends
								</span>
							</div>
						</div>
						<div className="sideBarChat">
							<UserChannel />
						</div>
				</div>
			)}
		</>
	);
}