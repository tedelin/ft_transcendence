import { useNavigate, useParams } from "react-router-dom";
import { fetchUrl } from "../fetch";
import { useEffect, useState } from "react";
import { ChannelUser } from "../utils/types";
import { getAvatar } from "../utils/utils";
import { Moderation } from "./Moderation";
import { useAuth } from "../components/AuthProvider";


export function ChannelUserList() {
	const { name } = useParams();
	const [channelUsers, setChannelsUsers] = useState<ChannelUser[] | []>([]);
	const [contextMenuUser, setContextMenuUser] = useState<any | null>(null);
	const [myRole, setMyRole] = useState<string>('');
	const navigate = useNavigate();
	const auth = useAuth();


	if (!name) {
		return (<div>You are not in a channel</div>)
	}

	async function fetchUserChannels() {
		try {
			const response = await fetchUrl(`/chat/channels/users/${name}`);
			setChannelsUsers(response);
			setMyRole(response.find((channelUser: ChannelUser) => channelUser.user.id === auth?.user?.id)?.role);
		} catch (error) {
			console.log(error);
		}
	}

	function handleContextMenu(user: any) {
		setContextMenuUser(user);
	}

	function closeContextMenu() {
		setContextMenuUser(null);
	}

	useEffect(() => {
		fetchUserChannels();

		auth?.socket?.on('user-role', (data: any) => {
			if (data.roomId !== name) return;
			setChannelsUsers((prevUsers) => {
				const updatedUsers = prevUsers.map((user: ChannelUser) => {
					if (user.user.id === auth?.user?.id && data.userId === auth?.user?.id) {
						setMyRole(data.role);
					}
					if (user.user.id === data.userId) {
						user.role = data.role;
					}
					return user;
				});
				return updatedUsers;
			});
		});

		auth?.socket?.on('user-muted', (data: any) => {
			if (data.roomId !== name) return;
			setChannelsUsers((prevUsers) => {
				const updatedUsers = prevUsers.map((user: ChannelUser) => {
					if (user.user.id === data.userId) {
						user.muted = data.muted;
					}
					return user;
				});
				return updatedUsers;
			});
		})

		auth?.socket?.on('join-channel', (user: any) => {
			if (user.channelName !== name) return;
			setChannelsUsers((prevUsers) => {
				const updatedUsers = [...prevUsers, user];
				return updatedUsers;
			});
		});

		auth?.socket?.on('leave-channel', (data: any) => {
			if (data.roomId !== name) return;
			setChannelsUsers((prevUsers) =>
				prevUsers.filter((user) => {
					if (user.user.id !== data.userId) {
						return user;
					}
				})
			);
		});

		return () => {
			auth?.socket?.off('user-role');
			auth?.socket?.off('join-channel');
			auth?.socket?.off('leave-channel');
			auth?.socket?.off('user-muted');
		}
	}, []);

	return (
		<>
			{channelUsers.map((channelUser: ChannelUser) =>
				<div
					key={channelUser.user.id}
					className="listItem"
				>
					<img 
						onClick={() => navigate('/profil/' + channelUser.user.id)}
						style={{ margin: 0 }} src={getAvatar(channelUser.user.avatar)} alt="User Avatar"></img>
					<span
						className="material-symbols-outlined"
					>
						{channelUser.role === "OWNER" && "shield_person"}
						{channelUser.role === "ADMIN" && "security"}
						{channelUser.role === "MEMBER" && "group"}
						{channelUser.role === "BANNED" && "block"}
						{channelUser.muted && "mic_off"}
					</span>
					<div
						className="channelUser"
					>
						<span>
							{channelUser.user.username}
						</span>

						<span
							className="material-symbols-outlined"
							onClick={() => handleContextMenu(channelUser)}
						>
							more_horiz
						</span>
					</div>
				</div>
			)}
			{contextMenuUser !== null && (
				<Moderation
					role={myRole}
					userRole={contextMenuUser.role}
					channel={name}
					userId={contextMenuUser.user.id}
					setEnabled={closeContextMenu}
					isMuted={contextMenuUser.muted}
				/>
			)}
		</>
	);
}