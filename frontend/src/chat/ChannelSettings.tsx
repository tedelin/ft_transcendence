import { useState, useEffect } from 'react';
import { fetchUrl } from '../fetch';
import { useToast } from '../utils/hooks/useToast';
import { Modal } from '../components/Modal';
import { Channel } from '../utils/types';
import '../styles/modal.css';


export function ChannelSettings({ enabled, setEnabled, name } : { enabled: boolean, setEnabled: Function, name: string }) {
	const [channelPassword, setChannelPassword] = useState('');
	const [channelName, setChannelName] = useState(name);
	const [channel, setChannel] = useState<Channel | null>(null);
	const { error, success } = useToast();

	function closeSettings() {
        setEnabled(false);
    }

	async function saveChanges() {
		try {
			const requestBody = channelPassword !== '' ?  {
				name: name,
				visibility: channel?.visibility,
				password: channelPassword,
			} : {
				name: name,
				visibility: channel?.visibility,
			}
			await fetchUrl(`/chat/channels/${name}`, {
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			});
			success('Channel settings updated !');
			closeSettings();
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
		if (channel) {
			setChannel({
			  ...channel,
			  visibility: newVisibility,
			});
		  }
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
        >
			<div className='fieldInfo'>Channel Name</div>
			<div className="modalContainer">
				<input 
					className='edit'
					type="text" 
					placeholder="Channel Name" 
					value={channelName} 
					onChange={(e) => setChannelName(e.target.value)}
				/>
				<select className="noMargin" value={channel?.visibility} onChange={(e) => changeVisibility(e.target.value)}>
					<option value="PUBLIC">Public</option>
					<option value="PRIVATE">Private</option>
					<option value="PROTECTED">Protected</option>
				</select>
				{channel?.visibility === 'PROTECTED' && 
				(<div className='row'>
					<input
						className='edit'
						onChange={(e) => setChannelPassword(e.target.value)}
						value={channelPassword}
						type="password" 
						placeholder="Channel Password" 
					/>
					<button 
						className='modalButton'
						onClick={() => changeVisibility('PUBLIC')}
					>
						Remove Password
					</button>
				</div>)}
				<div className='modalActions'>
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
						Save
					</button>
				</div>
			</div>
        </Modal>
    )
}
