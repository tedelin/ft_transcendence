import { useState, useEffect } from 'react';
import { fetchUrl } from '../fetch';
import { useToast } from '../utils/hooks/useToast';
import { Modal } from '../components/Modal';
import '../styles/modal.css';


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