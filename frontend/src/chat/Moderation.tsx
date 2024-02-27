import { useState, useEffect } from 'react';
import { fetchUrl } from '../fetch';
import { useToast } from '../utils/hooks/useToast';
import '../styles/modal.css';


export function Moderation({ enabled, channel, userId, setEnabled }: { enabled: boolean, channel: string, userId: number, setEnabled: Function }) {
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
        }
		setEnabled();
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
        }
		setEnabled();
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
        }
		setEnabled();
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
        }
		setEnabled();
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
        }
		setEnabled();
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!(event.target as HTMLElement).closest('.context-menu')) {
                setEnabled(false);
            }
        }

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [setEnabled]);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    useEffect(() => {
		function handleContextMenu(event: MouseEvent) {
			event.preventDefault();
			const posX = event.clientX;
			const posY = event.clientY;
	
			const menuWidth = 95;
			const menuHeight = 200;
			const screenWidth = window.innerWidth;
			const screenHeight = window.innerHeight;
	
			let adjustedX = posX;
			let adjustedY = posY;
	
			if (posX + menuWidth > screenWidth) {
				adjustedX = screenWidth - menuWidth;
			}
	
			if (posY + menuHeight > screenHeight) {
				adjustedY = screenHeight - menuHeight;
			}
	
			setPosition({ x: adjustedX, y: adjustedY });
		}

        if (enabled) {
            document.addEventListener('contextmenu', handleContextMenu);
        }

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [enabled]);

    return (
        enabled && (
            <div className="context-menu" style={{ position: 'absolute', top: position.y, left: position.x }}>
                <ul>
                    <li onClick={() => kickUser(userId, channel)}>Kick</li>
                    <li onClick={() => banUser(userId, channel)}>Ban</li>
                    <li onClick={() => muteUser(userId, channel)}>Mute</li>
                    <li onClick={() => promoteUser(userId, channel)}>Promote</li>
                    <li onClick={() => demoteUser(userId, channel)}>Demote</li>
                </ul>
            </div>
        )
    );
}