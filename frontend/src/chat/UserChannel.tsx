import { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { Channel } from './types/channel';
import { useAuth } from '../components/AuthProvider';
import { useNavigate, useParams } from 'react-router-dom';


export function UserChannel() {
	const [channels, setChannels] = useState([]);
	const navigate = useNavigate();
	const {name} = useParams();
	const auth = useAuth();

	async function fetchUserChannels() {
		try {
			const response = await fetchUrl(`/users/${auth?.user?.id}/channels`);
			setChannels(response.channels);
		} catch (error) {
			console.log(error);
		}
	}

	async function displayChannel(channelName: string) {
		navigate(`channels/${channelName}`);
	}

	useEffect(() => {
		auth?.socket?.on("leave-channel", (channel: any) => {
			setChannels(channels.filter((c: any) => c.channelName !== channel));
		});
		fetchUserChannels();
	}, [channels]);

	return (
		<>
			{channels.map((channel: Channel) =>
				<div
					key={channel.channelName}
					className={name === channel.channelName ? 'sideBarSelected' : 'sideBarChatItem'}
					onClick={() => { displayChannel(channel.channelName) }}
				>
					<img src="https://imgs.search.brave.com/MWlI8P3aJROiUDO9A-LqFyca9kSRIxOtCg_Vf1xd9BA/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc" alt="User Avatar"></img>
					<div className='sideBarChatName'>
						{channel.channelName}
					</div>
				</div>
			)}
		</>
	);
}