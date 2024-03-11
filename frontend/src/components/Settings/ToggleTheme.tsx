import { ThemeContext } from '../../utils/providers/ThemeProvider';
import { useContext } from 'react';

const ToggleTheme = () => {
	const { theme, toggleTheme } = useContext(ThemeContext);

	const buttonClass = theme === 'dark' ? 'toggle-theme-button active' : 'toggle-theme-button';

	return (
	<div className="toggle-theme">
		<strong>Dark mode</strong>
		<div className='theme-button-wrapper'>
			{theme}
			<button className={buttonClass} onClick={() => toggleTheme()}></button>
		</div>
	</div>
	);
  };
  
  export default ToggleTheme;
