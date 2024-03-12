import '../../styles/chat.css';
import { useGame } from '../../components/GameProvider';
import { useAuth } from '../../components/AuthProvider';
import { Outlet, useNavigate } from 'react-router-dom';
import BlockBackNavigation from "../BlockBackNavigation";
import { useEffect } from 'react';
import '../../styles/gameSettings.css';


// export function Settings_game() {
//     const auth = useAuth();
//     const game = useGame();
//     const nav = useNavigate();

// useEffect(() => {
//     if ( game?.gameStarted || game?.showButton || !game?.settingsToDo) {
//         nav('/game/');
//     }
// }, [game]);

// const handleSaveSettings = () => {
//     console.log('ballSpeed : ' + game?.ballSpeed);
//     auth?.socket?.emit('clickSaveSettings', {
//         ballSpeed: game?.ballSpeed,
//         paddleSpeed: game?.paddleSpeed,
//         paddleHeight: game?.paddleHeight,
//         ballSize: game?.ballSize,
//         increasedBallSpeed: game?.increasedBallSpeed
//     });
//     game?.setSettingsToDo(false);
// }
//     return (
//         <>
//             {!game?.gameStarted && !game?.showButton && game?.settingsToDo && (
//                 <div className='settingsMenu'>
//                     <BlockBackNavigation />
//                     <div className='CrossIcon' onClick={() => {
//                         nav("/game");
//                         auth?.socket?.emit('crossMatchmaking');
//                     }}>&#10006;</div>
//                     <p style={{ margin: '20px', textAlign: 'center', textDecoration: 'underline', fontSize: '25px' }}>Settings</p>
//                     <div className="settingRow">
//                         <div className='label'>
//                             <label htmlFor="ballSpeed">Ball Speed :</label>
//                         </div>
//                         <input
//                             className='settingsSlider'
//                             type="range"
//                             id="ballSpeed"
//                             min="1"
//                             max="10"
//                             step="1"
//                             value={game?.ballSpeed}
//                             onChange={(e) => {
//                                 game?.setBallSpeed(() => parseInt(e.target.value));
//                                 console.log('set ball : ' + game?.ballSpeed)
//                             }}
//                         />
//                         <div className='number'>
//                             <span>{game?.ballSpeed}</span>
//                         </div>
//                     </div>

//                     <div className="settingRow">
//                         <div className='label'>
//                             <label htmlFor="BallSize">Ball Size :</label>
//                         </div>
//                         <input
//                             className='settingsSlider'
//                             type="range"
//                             id='ballSize'
//                             min='5'
//                             max='30'
//                             step='1'
//                             value={game?.ballSize}
//                             onChange={(e) => game?.setBallSize(parseInt(e.target.value))}
//                         />
//                         <div className='number'>
//                             <span>{game?.ballSize}</span>
//                         </div>
//                     </div>

//                     <div className='settingRow'>
//                         <div className='label'>
//                             <label htmlFor="increasedBallSpeed">Increased Ball Speed/s :</label>
//                         </div>
//                         <input
//                             className='settingsSlider'
//                             type="range"
//                             id="increasedBallSpeed"
//                             min="0.001"
//                             max="0.010"
//                             step="0.001"
//                             value={game?.ballSpeed}
//                             onChange={(e) => game?.setIncreasedBallSpeed(parseFloat(e.target.value))}
//                         />
//                         <div className='number'>
//                             <span>{game?.ballSpeed}</span>
//                         </div>
//                     </div>

//                     <div className="settingRow">
//                         <div className='label'>
//                             <label htmlFor="paddleHeight">Paddle Height :</label>
//                         </div>
//                         <input
//                             className='settingsSlider'
//                             type="range"
//                             id="paddleHeight"
//                             min="100"
//                             max="300"
//                             step="1"
//                             value={game?.paddleHeight}
//                             onChange={(e) => game?.setPaddleHeight(parseInt(e.target.value))}
//                         />
//                         <div className='number'>
//                             <span>{game?.paddleHeight}</span>
//                         </div>
//                     </div>

//                     <div className="settingRow">
//                         <div className='label'>
//                             <label htmlFor="paddleSpeed">Paddle Speed :</label>
//                         </div>
//                         <input
//                             className='settingsSlider'
//                             type="range"
//                             id="paddleSpeed"
//                             min="1"
//                             max="10"
//                             step="1"
//                             value={game?.paddleSpeed}
//                             onChange={(e) => game?.setPaddleSpeed(parseInt(e.target.value))}
//                         />
//                         <div className='number'>
//                             <span>{game?.paddleSpeed}</span>
//                         </div>
//                     </div>
// <div className='buttonContainer'>
//     <Link to="/game/matchmaking" className='SettingsButton' onClick={handleSaveSettings}>next</Link>
// </div>
//                 </div>
//             )}
//         </>
//     );
// }

import { TopBar } from './topBar';
import { RightBar } from './rightBar';

export function Settings_game() {
    const game = useGame();
    const nav = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        if (game?.gameStarted || game?.showButton || !game?.settingsToDo) {
            nav('/game/');
        }
    }, [game]);

    const handleSaveSettings = () => {
        auth?.socket?.emit('clickSaveSettings', {
            ballSpeed: game?.ballSpeed,
            paddleSpeed: game?.paddleSpeed,
            paddleHeight: game?.paddleHeight,
            ballSize: game?.ballSize,
            increasedBallSpeed: game?.increasedBallSpeed
        });
        game?.setSettingsToDo(false);
    }

    return (
        <>
            < BlockBackNavigation />
            < TopBar />
            <div className='rowDirection'>
                < Outlet />
                < RightBar handleSaveSettings={handleSaveSettings}/>
            </div>
        </>
    );
}

