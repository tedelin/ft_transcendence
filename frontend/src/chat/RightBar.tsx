import { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from '../components/AuthProvider';
import { getAvatar } from '../utils/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import "../styles/sideBar.css";
import { PrivateMessage } from '../utils/types';
import { ChannelUserList } from './ChannelUserList';

function PrivateMessageList({}) {
	const [privateMessage, setPrivateMessage] = useState<PrivateMessage[] | []>([]);
	const auth = useAuth();
	const navigate = useNavigate();

	async function fetchPrivateMessages() {
		try {
			const response = await fetchUrl(`/private-messages/conversations`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
				},
			});
			setPrivateMessage(response);
		} catch (err: any) {
			console.error(err.message);
		}
	}

	function goTo(conversationId: number) {
		navigate(`/chat/private-messages/${conversationId}`);
	}

	useEffect(() => {
		fetchPrivateMessages();
		auth?.socket?.on('user-state', (data) => {
			const updateDM = privateMessage.map((dm: PrivateMessage) => {
				if (dm.id === data.id) {
					return { ...dm, status: data.status };
				}
				return dm;
			});
			setPrivateMessage(updateDM);
		});
	}, [privateMessage]);

	return (
		<>
			{privateMessage.map((dm: any) => {
				if (dm.id !== auth?.user?.id) {
					return (
						<div key={dm.username} className='listItem'
							onClick={() => goTo(dm.id)}
						>
							<div className='statusContainer'>
								<img
									className='smallAvatar' src={getAvatar(dm.avatar)} alt={dm.username} />
							</div>
							<span>{dm.username}</span>
						</div>
					);
				}
			})}
		</>
	);
}

function ChannelList() {
	const [channels, setChannels] = useState([]);
	const auth = useAuth();
	const navigate = useNavigate();

	async function fetchChannels() {
		try {
			const response = await fetchUrl(`/users/${auth?.user?.id}/channels`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
				},
			});
			setChannels(response.channels);
		} catch (err: any) {
			console.error(err.message);
		}
	}

	function goTo(channel: string) {
		navigate(`/chat/channels/${channel}`);
	}

	useEffect(() => {
		fetchChannels();
	}, []);

	return (
		<>
			{channels.map((channel: any) => (
				<div key={channel.channelName} className='listItem'
					onClick={() => goTo(channel.channelName)}
				>
					{channel.channelName}
				</div>
			))}		
		</>
	)
}


export function RightBar() {
	const [selected, setSelected] = useState('channels');
	const location = useLocation();

	useEffect(() => {
		if (location.pathname.startsWith('/chat/channels/')) {
			setSelected('channelUsers');
		}
		if (selected === "channelUsers" && !location.pathname.startsWith('/chat/channels/')) {
			setSelected('channels');
		}
	}, [location.pathname]);
	
	return (
		<div className="sideBar">
			<select className="sideBarSelect" value={selected} onChange={(e) => setSelected(e.target.value)}>
				<option value="channels">Channels</option>
				<option value="privateMessages">Private Messages</option>
				{location.pathname.startsWith('/chat/channels/') && <option value="channelUsers">Channel Users</option>}
			</select>
			<div className='list'>
				{selected === 'channels' && <ChannelList />}
				{selected === 'privateMessages' && <PrivateMessageList />}
				{location.pathname.startsWith('/chat/channels/') && selected === 'channelUsers' && <ChannelUserList />}
			</div>
		</div>
	);
}