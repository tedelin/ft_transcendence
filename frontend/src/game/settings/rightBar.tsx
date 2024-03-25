import { useContext } from 'react';
import lightPaddle from '../../game_img/lightPaddle.svg';
import darkPaddle from '../../game_img/darkPaddle.png';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../utils/providers/ThemeProvider';

export function RightBar({ handleSaveSettings }) {
    const nav = useNavigate();
    const { theme } = useContext(ThemeContext) as { theme: string };;

    
    const paddle = theme == 'light' ? lightPaddle : darkPaddle;

    return (
        <div className='RightBar'>
            <div className='list'>
                <div className='listItem' id='listItem' onClick={() => nav('/game/settings/ball')} >
                    <span className="material-symbols-outlined ballLogo">sports_volleyball</span>
                    <span>Ball</span>
                </div>
                <div className='listItem' onClick={() => nav('/game/settings/paddle')}>
                        <img src={paddle} alt="paddle" className='paddleLogo' />
                    <span>Paddle</span>
                </div>
            </div>
            <div className='SaveSettingsGameWrapper'>
                <Link to="/game/matchmaking" className='SaveSettingsGame' onClick={handleSaveSettings}>Save</Link>
            </div>
        </div>
    )
}