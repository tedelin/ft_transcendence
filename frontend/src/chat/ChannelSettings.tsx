import { useState, useEffect } from 'react';
import { fetchUrl } from '../fetch';
import { useToast } from '../utils/hooks/useToast';
import '../styles/modal.css';
import Modal from '../components/Modal';


export function ChannelSettings({ enabled, setEnabled, name }) {
	const [channelPassword, setChannelPassword] = useState('');
	const { error } = useToast();
	const [channel, setChannel] = useState(null);

	function closeSettings() {
        setEnabled(false);
    }

	async function saveChanges() {
		try {
			await fetchUrl(`/chat/channels/${name}`, {
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: name,
					password: channelPassword,
					visibility: channel?.visibility,
				}),
			});
		} catch (err: any) {
			error(err.message);
		}
	}

	async function fetchChannel(name: any) {
		try {
			const response = await fetchUrl(`/chat/channels/${name}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			setChannel(response);
		} catch (err: any) {
			error(err.message);
		}
	}

	function changeVisibility(newVisibility: string) {
		setChannel(prevChannel => ({
			...prevChannel,
			visibility: newVisibility
		}));
	}

	useEffect(() => {
		if (enabled) {
			fetchChannel(name);
		}
	}, [enabled]);

    return (
        <Modal
            isOpen={enabled}
            onClose={closeSettings}
            title='Channel Settings'
        >
			<div className="channelSettings">
				<input 
					className='edit'
					type="text" 
					placeholder="Channel Name" 
					value={name} 
					onChange={(e) => setChannelName(e.target.value)}
				/>
				{channel?.visibility === 'PUBLIC' ? 
				<button
					className='modalButton'
					onClick={() => changeVisibility('PROTECTED')}
				>
					Add Password
				</button> :
				(<div>
					<input
						className='edit'
						onChange={(e) => setChannelPassword(e.target.value)}
						value={channelPassword}
						type="password" 
						placeholder="Channel Password" 
					/>
					<button 
						className='cancelButton'
						onClick={() => changeVisibility('PUBLIC')}
					>
						Remove Password
					</button>
					<button className='saveButton'>Change Password</button>
				</div>)}
				<button
					onClick={closeSettings}
					className='cancelButton'
				>
						Cancel
				</button>
				<button
					onClick={saveChanges}
					className='saveButton'
				>
					Save Changes
				</button>
			</div>
        </Modal>
    )
}

export function Moderation({ enabled, channel, setEnabled }) {
    const [channelUsers, setChannelUsers] = useState([]);
    const token = localStorage.getItem('jwtToken');
    const { error } = useToast();

    function closeModeration() {
        setEnabled(false);
    }

    async function fetchChannelUsers() {
        try {
            const response = await fetchUrl(`/chat/channels/users/${channel}`, {
                method: 'GET',
            });
            setChannelUsers(response);
        } catch (err: any) {
            error(err.message);
        }
    }

    async function banUser(userId: number, roomId: string) {
        try {
            await fetchUrl(`/moderation/ban/${roomId}/${userId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
        } catch (err: any) {
            error(err.message)
        }
    }

    async function kickUser(userId: number, roomId: string) {
        try {
            await fetchUrl(`/moderation/kick/${roomId}/${userId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setChannelUsers((prevUsers) =>
                prevUsers.filter((user) => user.id !== userId)
            );
        } catch (err: any) {
            error(err.message)
        }
    }

    async function muteUser(userId: number, roomId: string) {
        try {
            await fetchUrl(`/moderation/mute/${roomId}/${userId}/10`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (err: any) {
            error(err.message)
        }
    }

    async function promoteUser(userId: number, roomId: string) {
        try {
            await fetchUrl(`/moderation/promote/${roomId}/${userId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (err: any) {
            error(err.message)
        }
    }

    async function demoteUser(userId: number, roomId: string) {
        try {
            await fetchUrl(`/moderation/demote/${roomId}/${userId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (err: any) {
            error(err.message)
        }
    }

    useEffect(() => {
        if (enabled)
            fetchChannelUsers();
    }, [enabled]);

    return (
        <Modal
            isOpen={enabled}
            onClose={closeModeration}
            title='Channel Moderation'
        >

            <div className="userList">
                {channelUsers.map((channel) => (
                    <div key={channel.user.id} className="user">
                        {/* <img src={channel.user.avatar} alt="User Avatar"></img> */}
                        <span>{channel.user.username}</span>
                        <button
                            className="declineFriend"
                            onClick={() => { kickUser(channel.user.id, channel.channelName) }}
                        >
                            Kick
                        </button>
                        <button
                            className="declineFriend"
                            onClick={() => { banUser(channel.user.id, channel.channelName) }}
                        >
                            Ban
                        </button>
                        <button
                            className="declineFriend"
                            onClick={() => { muteUser(channel.user.id, channel.channelName) }}
                        >
                            Mute
                        </button>
                        <button
                            className="declineFriend"
                            onClick={() => { promoteUser(channel.user.id, channel.channelName) }}
                        >
                            Promote
                        </button>
                        <button
                            className="declineFriend"
                            onClick={() => { demoteUser(channel.user.id, channel.channelName) }}
                        >
                            Demote
                        </button>
                    </div>
                ))}
            </div>
        </Modal>
    )
}