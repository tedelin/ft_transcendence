import { useState, useContext } from 'react';
import Avatar from '../components/Settings/Avatar';
import UsernameSettings from '../components/Settings/UsernameSettings';
import BioSettings from '../components/Settings/BioSettings';
import TwoFaSettings from '../components/TwoFaSettings';
import { useAuth } from '../components/AuthProvider';
import { getAvatar } from '../utils/utils';
import { useToast } from '../utils/hooks/useToast';
import { ThemeContext } from '../utils/providers/ThemeProvider';
import '../styles/settings.css';

function Settings() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const auth = useAuth();
  const [preview, setPreview] = useState(getAvatar(auth?.user?.avatar));
  const [username, setUsername] = useState(auth?.user?.username || '');
  const [bio, setBio] = useState(auth?.user?.bio || '');
  const token = localStorage.getItem('jwtToken');
  const { error } = useToast();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // Crée un URL pour l'aperçu
    }
  };

  const handleUpload = async (event) => {
	event.preventDefault();
  
	const formData = new FormData();
	if (selectedFile) {
	  formData.append('avatar', selectedFile);
	}
	formData.append('username', username);
	formData.append('bio', bio);
  
	try {
	  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/upload-change`, {
		method: 'POST',
		headers: {
		  'Authorization': `Bearer ${token}`,
		},
		body: formData,
	  });
  
	  if (response.ok) {
		alert("Informations uploadées avec succès !");
		window.location.reload();
	  } else {
		const errorData = await response.json();
		console.log(errorData.message);
		error(errorData.message);
	  }
	} catch (err : any) {
	  console.error("Erreur lors de l'upload:", err);
	  error(err);
	}
  };
  
  

  return (
    <div className='settingsPage'>
      <div className='info-settings'>
        <UsernameSettings username={username} setUsername={setUsername} />
        <BioSettings bio={bio} setBio={setBio} />
        <TwoFaSettings />
		<div className="header-toggle-buttons">
          <button onClick={() => toggleTheme()}>{theme}</button>
        </div>
      </div>
      <div className='right-side'>
        <Avatar handleFileChange={handleFileChange} preview={preview}/>
        <button onClick={handleUpload} className='save'>SAVE</button>
      </div>
    </div>
  );
}

export default Settings;
