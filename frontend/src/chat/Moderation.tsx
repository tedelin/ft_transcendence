import { fetchUrl } from '../fetch';
import { useToast } from '../utils/hooks/useToast';
import { Modal } from '../components/Modal';


export function Moderation({ role, channel, userId, setEnabled, userRole, isMuted }: { role: string, channel: string, userId: number, setEnabled: Function, userRole: string, isMuted: boolean}) {
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
            await fetchUrl(`/moderation/mute/${roomId}/${userId}`, {
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

	async function unmuteUser(userId: number, roomId: string) {
		try {
			await fetchUrl(`/moderation/unmute/${roomId}/${userId}`, {
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
					{!isMuted  && <button className='modalButton' onClick={() => muteUser(userId, channel)}>Mute</button>}
					{(userRole !== "ADMIN" && userRole !== "BANNED") && <button className='modalButton' onClick={() => promoteUser(userId, channel)}>Promote</button>}
					{(userRole !== "MEMBER" && userRole !== "BANNED") && <button className='modalButton' onClick={() => demoteUser(userId, channel)}>Demote</button>}
					{isMuted && <button className='modalButton' onClick={() => unmuteUser(userId, channel)}>Unmute</button>}
				</div>
			</Modal>
        )
    );
}