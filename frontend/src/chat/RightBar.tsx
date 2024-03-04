import React, { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from '../components/AuthProvider';
import { getAvatar } from '../utils/utils';
import { useNavigate } from 'react-router-dom';

function PrivateMessageList({}) {
	const [privateMessage, setPrivateMessage] = useState([]);
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
			console.log(response);
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
	}, []);

	return (
		<>
			{privateMessage.map((dm: any) => {
				if (dm.id !== auth?.user?.id) {
					return (
						<div key={dm.username} className='listItem'
							onClick={() => goTo(dm.id)}
						>
							<img src={getAvatar(dm.avatar)} alt={dm.username} />
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
			console.log(response);
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
    return (
        <div className="rightBar">
            {/* <div className="topSide">
                <h2 className="rightBarTitle">Messages</h2>
            </div> */}
			<select className="rightBarSelect" onChange={(e) => setSelected(e.target.value)}>
				<option value="channels">Channels</option>
				<option value="privateMessages">Private Messages</option>
			</select>
			<div className='rightBarList'>
				{selected === 'channels' ? <ChannelList /> : <PrivateMessageList />}
			</div>
        </div>
    );
}