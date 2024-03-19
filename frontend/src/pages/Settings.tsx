import { useState } from 'react';
import Avatar from '../components/Settings/Avatar';
import UsernameSettings from '../components/Settings/UsernameSettings';
import BioSettings from '../components/Settings/BioSettings';
import TwoFaSettings from '../components/TwoFaSettings';
import ToggleTheme from '../components/Settings/ToggleTheme'
import { useAuth } from '../components/AuthProvider';
import { getAvatar } from '../utils/utils';
import { useToast } from '../utils/hooks/useToast';
import '../styles/settings.css';
import { fetchUrl } from '../fetch';

function Settings() {
	const [selectedFile, setSelectedFile] = useState(null);
	const auth = useAuth();
	const [preview, setPreview] = useState(getAvatar(auth?.user?.avatar));
	const [username, setUsername] = useState(auth?.user?.username || '');
	const [bio, setBio] = useState(auth?.user?.bio || '');
	const token = localStorage.getItem('jwtToken');
	const { error } = useToast();

	const handleFileChange = (event : any) => {
		const file = event.target.files[0];
		if (file) {
			setSelectedFile(file);
			setPreview(URL.createObjectURL(file));
		}
	};

	const handleUpload = async (event : any) => {
		event.preventDefault();

		const formData = new FormData();
		if (selectedFile) {
			formData.append('avatar', selectedFile);
		}
		formData.append('username', username);
		formData.append('bio', bio);

		try {
			await fetchUrl(`/users/upload-change`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
				body: formData,
			});
			window.location.reload();
		} catch (err: any) {
			error(err.message);
		}
	};



	return (
		<div className='settings-wrapper'>
			<div className='settingsPage'>
				<div className='info-settings'>
					<UsernameSettings username={username} setUsername={setUsername} />
					<BioSettings bio={bio} setBio={setBio} />
					<TwoFaSettings />
					<ToggleTheme />
				</div>
				<div className='right-side'>
					<Avatar handleFileChange={handleFileChange} preview={preview} />
					<button onClick={handleUpload} className='save'>SAVE</button>
				</div>
			</div>
		</div>
	);
}

export default Settings;
