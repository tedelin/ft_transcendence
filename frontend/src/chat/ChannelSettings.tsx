import { useState, useEffect } from 'react';
import { fetchUrl } from '../fetch';
import { useToast } from '../utils/hooks/useToast';
import { Modal } from '../components/Modal';
import '../styles/modal.css';


export function ChannelSettings({ enabled, setEnabled, name }) {
	const [channelPassword, setChannelPassword] = useState('');
	const { error, success } = useToast();
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
			success('Channel settings updated !');
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
