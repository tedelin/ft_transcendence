import '../styles/game.css';
import '../styles/matchmaking.css';
import { useState, useEffect, useRef } from 'react'
import { MatchmakingView } from './MatchmakingView';
import { useAuth } from '../components/AuthProvider';
import { useGame } from '../components/GameProvider';
import { useNavigate } from 'react-router-dom';
import BlockBackNavigation from "./BlockBackNavigation";

export function Matchmaking() {
    const game = useGame();
    const auth = useAuth();
    const nav = useNavigate();

    useEffect(() => {
        if (game?.gameStarted || game?.showButton || game?.settingsToDo) {
            nav('/game/');
        }
    }, [game]);

    function Countdown() {
        const [count, setCount] = useState(3);

        if (game)
            game.PreviousUrl = "countdown";

        useEffect(() => {
            const countdownInterval = setInterval(() => {
                setCount((prevCount) => prevCount - 1);
            }, 1500);

            if (count === 0)
                clearInterval(countdownInterval);

            return () => clearInterval(countdownInterval);
        }, [count]);

        return (<div className='countDown'>{count}</div>);
    }

    return (
        <>
            {!game?.gameStarted && !game?.showButton && !game?.settingsToDo && (
                <div className="matchmaking">
                    < BlockBackNavigation />
                    {!game?.letsGO && <div className='CrossIcon' onClick={() => {
                        auth?.socket?.emit('crossMatchmaking');
                        nav('/game');
                    }}>&#10006;</div>}
                    <MatchmakingView />
                    {game?.letsGO && (
                        <div className="matchmaking-container">
                            <span className="letsgo">Let's GO !</span>
                            <Countdown />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}