import { useParams } from "react-router-dom";
import { fetchUrl } from "../fetch";
import { useEffect, useState } from "react";
import { ChannelUser } from "../utils/types";
import { getAvatar } from "../utils/utils";


export function ChannelUserList() {
	const {name} = useParams();
	const [channelUsers, setChannelsUsers] = useState([]);

	if (!name) {
		return (<div>You are not in a channel</div>)
	}

	async function fetchUserChannels() {
		try {
			const response = await fetchUrl(`/chat/channels/users/${name}`);
			setChannelsUsers(response);
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		fetchUserChannels();
	}, []);

	return (
		<>
			{channelUsers.map((channelUser: ChannelUser) =>
				<div
					key={channelUser.user.id}
					className="listItem"
				>
					<img src={getAvatar(channelUser.user.avatar)} alt="User Avatar"></img>
					<span>
						{channelUser.user.username}
					</span>
					<span
					className="material-symbols-outlined"
					>
						{channelUser.role === "OWNER" && "shield_person"}
						{channelUser.role === "ADMIN" && "security"}
						{channelUser.role === "MEMBER" && "group"}
					</span>
				</div>
			)}
		</>
	);
}