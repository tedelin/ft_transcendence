import { Modal } from '../components/Modal';
import '../styles/modal.css';
import { useEffect, useState } from 'react';
import { fetchUrl } from '../fetch';
import { useToast } from '../utils/hooks/useToast';
import { User } from '../utils/types';
import { getAvatar } from '../utils/utils';
import { useAuth } from '../components/AuthProvider';


export function AddFriendModal({ enabled, setEnabled } : { enabled: boolean, setEnabled: (Function) }) {
	const [input, setInput] = useState('');
	const [users, setUsers] = useState<User[] | []>([]);
	const { error, success } = useToast();
	const auth = useAuth();

	function closeSettings() {
		setEnabled(false);
	}

	async function fetchUser(value: string) {
		try {
			const response = await fetchUrl(`/users?search=${input}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
				},
			});
			const filtered = response.filter((user: User) => {
				if (user.id === auth?.user?.id) return false;
				const username = user.username || '';
				const lowercaseUsername = username.toLowerCase();
				const lowercaseValue = value.toLowerCase();
				return lowercaseUsername.includes(lowercaseValue);
			});
			setUsers(filtered);
		} catch (err: any) {
			error(err.message);
		}
	}

	async function sendRequest(userId: number) {
		try {
			await fetchUrl(`/friends/${userId}`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
				},
			});
			success('Friend request sent');
		} catch (err: any) {
			error(err.message);
		}
	}

	async function handleChange(value: string) {
		setInput(value);
	}

	useEffect(() => {
		if (enabled) {
			fetchUser('');
		}
	}, [enabled, input]);

	return (
		<Modal isOpen={enabled} onClose={closeSettings}>
			<input type="text" placeholder="Search User" value={input} onChange={(e) => handleChange(e.target.value)} />
			<div className='list'>
				{users.length > 0 ? users.map((user: User) => (
					<div key={user.id} className='listItem'>
						<div className='statusContainer'>
							<img
								className='smallAvatar'
								src={getAvatar(user.avatar)}
								alt='avatar'
							/>
							<span className={`status ${user.status === "ONLINE" ? "online" : "offline"}`}></span>
						</div>
						<span className='spanMargin'>
							{user.username}
						</span>
						<div className='friendActions'>
							<button 
								className='addFriendButton'
								onClick={() => sendRequest(user.id)}
							>
								<span className="material-symbols-outlined">
									person_add
								</span>
							</button>
						</div>
					</div>
				)) : <div>No users found</div>}
			</div>
		</Modal>
	);
}