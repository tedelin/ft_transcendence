import { useState, useEffect } from 'react';
import { fetchUrl } from '../fetch';
import { useToast } from '../utils/hooks/useToast';
import '../styles/contextMenu.css';
import { Modal } from '../components/Modal';


export function Moderation({ role, channel, userId, setEnabled, userRole }: { role: string, channel: string, userId: number, setEnabled: Function, userRole: string }) {
    const token = localStorage.getItem('jwtToken');
    const { error } = useToast();

    async function banUser(userId: number, roomId: string) {
        try {
            await fetchUrl(`/moderation/ban/${roomId}/${userId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (err: any) {
            error(err.message);
		} finally {
			setEnabled();
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
        } catch (err: any) {
            error(err.message);
		} finally {
			setEnabled();
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
            error(err.message);
		} finally {
			setEnabled();
		}
    }

	// async function unmuteUser(userId: number, roomId: string) {
	// 	try {
	// 		// await fetchUrl(`/moderation/unmute/${roomId}/${userId}`, {
	// 	} catch (err: any) {
	// 		error(err.message);
	// 	}
	// }

    async function promoteUser(userId: number, roomId: string) {
        try {
            await fetchUrl(`/moderation/promote/${roomId}/${userId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (err: any) {
            error(err.message);
		} finally {
			setEnabled();
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
            error(err.message);
		} finally {
			setEnabled();
		}
    }

    return (
        (role === "ADMIN" || role === "OWNER") && (
			<Modal
				isOpen={true}
				onClose={() => setEnabled(false)}
				title={`Moderation`}
			>
				<div className='modalContainer'>
					<button className='modalButton' onClick={() => kickUser(userId, channel)}>{userRole === "BANNED" ? "Unban" : "Kick"}</button>
					{userRole !== "BANNED" && <button className='modalButton' onClick={() => banUser(userId, channel)}>Ban</button>}
					{userRole !=="BANNED" && <button className='modalButton' onClick={() => muteUser(userId, channel)}>Mute</button>}
					{userRole !== ("ADMIN" && "MUTED" && "BANNED") && <button className='modalButton' onClick={() => promoteUser(userId, channel)}>Promote</button>}
					{userRole !== ("MEMBER" && "MUTED" && "BANNED") && <button className='modalButton' onClick={() => demoteUser(userId, channel)}>Demote</button>}
					{/* {userRole === "MUTED" && <button className='modalButton' onClick={() => promoteUser(userId, channel)}>Unmute</button>} */}
				</div>
			</Modal>
        )
    );
}