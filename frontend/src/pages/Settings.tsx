import AvatarUpload from '../components/Settings/Avatar';
import UsernameSettings from '../components/Settings/UsernameSettings';
import BioSettings from '../components/Settings/BioSettings';
import TwoFaSettings from '../components/TwoFaSettings'
import '../styles/settings.css';

function Settings() {
  return (
    <div className='settingsPage'>
      <div className='info-settings'>
        <UsernameSettings />
        <BioSettings />
        <TwoFaSettings />
      </div>
      <div className='right-side'>
        <AvatarUpload />
        <button className='save'>Save</button>
      </div>
    </div>
  );
}

export default Settings;
