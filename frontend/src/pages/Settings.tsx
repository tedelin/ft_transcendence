import AvatarUpload from '../components/Avatar';
import TwoFaSettings from '../components/TwoFaSettings'
import { useContext } from 'react';
import { ThemeContext } from '../utils/providers/ThemeProvider';

function Settings() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div>
      <h1>Settings</h1>
      <AvatarUpload />
      <TwoFaSettings />
      <div className="header-toggle-buttons">
        <button onClick={() => toggleTheme()}>{theme}</button>
      </div>
    </div>
  );
}

export default Settings;
