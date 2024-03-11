import ball from '../../game_img/logo.png';
import paddle from '../../game_img/paddle.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


export function RightBar({handleSaveSettings}) {
    const nav = useNavigate();
    const location = useLocation();
    const [backgroundBall, setBackgroundBall] = useState("white");
    const [backgroundPaddle, setBackgroundPaddle] = useState("white");

    useEffect(() => {
        if (location.pathname === '/game/settings/ball')
            setBackgroundBall('lightgrey');
        else
            setBackgroundBall('white');
        if (location.pathname === '/game/settings/paddle')
            setBackgroundPaddle('lightgrey');
        else
            setBackgroundPaddle('white');

    })

    return (
        <div className='RightBar'>
            <div className='list'>
                <div className='listItem BallTab' id='listItem' onClick={() => nav('/game/settings/ball')} style={{ background: backgroundBall, borderRadius: '10px' }}>
                    <img src={ball} alt="ball" />
                    <span>Ball</span>
                </div>
                <div className='listItem PaddleTab' onClick={() => nav('/game/settings/paddle')} style={{ background: backgroundPaddle, borderRadius: '10px' }}>
                    <img src={paddle} alt="paddle" />
                    <span>Paddle</span>
                </div>
            </div>
            <div className='SaveSettingsGameWrapper'>
                <Link to="/game/matchmaking" className='SaveSettingsGame' onClick={handleSaveSettings}>Save</Link>
            </div>

            {/* <div className="ballContainer" onClick={() => nav('/game/settings/ball')} style={{background : backgroundBall}}>
            </div>
            <div className="paddleContainer" onClick={() => nav('/game/settings/paddle')} style={{background : backgroundPaddle}}>
                <img src={paddle} alt="paddle" />
                <button>Paddle</button>
            </div>
            <div className='saveContainer'>
                <button className='save'>Save</button>
            </div> */}
        </div>
    )
}