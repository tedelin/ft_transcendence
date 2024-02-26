import { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { useAuth } from '../components/AuthProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { ChannelUser } from '../utils/types';


export function UserChannel() {
	const [channels, setChannels] = useState<ChannelUser[] | []>([]);
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
		auth?.socket?.on("leave-channel", (channel: string) => {
			setChannels(channels.filter((c: ChannelUser) => c.channelName !== channel));
		});
		fetchUserChannels();
	}, [channels]);

	return (
		<>
			{channels.map((channel: ChannelUser) =>
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