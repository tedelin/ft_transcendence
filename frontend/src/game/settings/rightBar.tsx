import paddle from '../../game_img/paddle.png';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


export function RightBar({handleSaveSettings}) {
    const nav = useNavigate();

    return (
        <div className='RightBar'>
            <div className='list'>
                <div className='listItem' id='listItem' onClick={() => nav('/game/settings/ball')} >
					<span className="material-symbols-outlined">sports_volleyball</span>
                    <span>Ball</span>
                </div>
                <div className='listItem' onClick={() => nav('/game/settings/paddle')}>
                    <img src={paddle} alt="paddle" />
                    <span>Paddle</span>
                </div>
            </div>
            <div className='SaveSettingsGameWrapper'>
                <Link to="/game/matchmaking" className='SaveSettingsGame' onClick={handleSaveSettings}>Save</Link>
            </div>
        </div>
    )
}