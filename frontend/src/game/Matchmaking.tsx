import '../styles/game.css';
import '../styles/matchmaking.css';
import { useState, useEffect } from 'react'
import { MatchmakingView } from './MatchmakingView';
import { useAuth } from '../components/AuthProvider';
import { useGame } from '../components/GameProvider';

export function Matchmaking() {
    const game = useGame();
    const auth = useAuth();

    function Countdown() {
        const [count, setCount] = useState(3);

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
        <div className="matchmaking">
            {!game?.letsGO && <div className='CrossIcon' onClick={() => {
                auth?.socket?.emit('crossMatchmaking');
            }}>&#10006;</div>}
            <MatchmakingView/>
            {game?.letsGO && (
                <div className="matchmaking-container">
                    <span className="letsgo">Let's GO !</span>
                    <Countdown />
                </div>
            )}
        </div>
    );
}