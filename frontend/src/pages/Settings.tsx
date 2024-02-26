import AvatarUpload from '../components/Avatar'; 
import TwoFaSettings from '../components/TwoFaSettings'

function Settings() {
  return (
    <div>
      <h1>Settings</h1>
      <AvatarUpload />
      <TwoFaSettings />
    </div>
  );
}

export default Settings;
