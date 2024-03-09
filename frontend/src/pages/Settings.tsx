import AvatarUpload from '../components/Settings/Avatar';
import UsernameSettings from '../components/Settings/UsernameSettings';
import BioSettings from '../components/Settings/BioSettings';
import TwoFaSettings from '../components/TwoFaSettings'
import { useContext } from 'react';
import { ThemeContext } from '../utils/providers/ThemeProvider';
import '../styles/settings.css';

function Settings() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className='settingsPage'>
      <div className='info-settings'>
        <UsernameSettings />
        <BioSettings />
        <TwoFaSettings />
      </div>
      <div className='right-side'>
        <AvatarUpload />
		<div className="header-toggle-buttons">
			<button onClick={() => toggleTheme()}>{theme}</button>
		</div>
        <button className='save'>SAVE</button>
      </div>
    </div>
  );
}

export default Settings;
