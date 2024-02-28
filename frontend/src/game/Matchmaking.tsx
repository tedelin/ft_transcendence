import React from 'react';
import './game.css';
import './matchmaking.css';
import { useState, useEffect} from 'react'
import { MatchmakingView } from './MatchmakingView';
import { useAuth } from '../components/AuthProvider';

export function Matchmaking({ playerOne, playerTwo, letsgo }) {

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

        return <div className='countDown'>{count}</div>;
    }

    return (
        <div className="matchmaking">
            {!letsgo && <div className='CrossIcon' onClick={() => {
                auth?.socket?.emit('crossMatchmaking');
                }}>&#10006;</div>}
            <MatchmakingView playerOne={playerOne} playerTwo={playerTwo} />
            {letsgo && (
                <div className="matchmaking-container">
                    <span className="letsgo">Let's GO !</span>
                    <Countdown />
                </div>
            )}
        </div>
    );
}