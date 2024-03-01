import { useEffect } from 'react';
import { useState, useRef } from 'react';
import React from 'react';
import './game.css';
import './button.css';
import './matchmaking.css'
import { useAuth } from '../components/AuthProvider';
import BoobaImg from './booba.jpeg';
import profil from './profil.jpeg';
const ENDED = 1;

export function StartGame({ gameInstance, spectatorBase }) {
    const [score, setScore] = useState({ player1: 0, player2: 0});
    const [spectators, setSpectators] = useState(spectatorBase);

    const auth = useAuth();
    const handleKeyDown = (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            auth?.socket?.emit('keyAction', { key: event.key, action: 'pressed' });
        }
    };

    const handleKeyUp = (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            auth?.socket?.emit('keyAction', { key: event.key, action: 'released' });
        }
    };

    useEffect(() => {
        gameInstance.startGame();

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        auth?.socket?.on('gameStateUpdate', (data) => {
            if (data) {
                setScore({ 
                    player1: data.gameState.score.player1, 
                    player2: data.gameState.score.player2
                });
            }
            else
                console.log("no data in start game");
        });

        auth?.socket?.on('spectators', (data) => {
            console.log(data.spectators);
            if (Array.isArray(data.spectators)) {
                console.log(`Received : ${data.spectators}`)
                setSpectators(data.spectators);
            } else {
                console.error("Received no data");
                setSpectators([]);
            }
        });
        console.log("spectators on listening now");

        return () => {
            document.removeEventListener("keydown", gameInstance.handleKeyDown);
            document.removeEventListener("keyup", gameInstance.handleKeyUp);
            auth?.socket?.off('spectators');
            auth?.socket?.off('gameStateUpdate')
        };
    }, [gameInstance, auth?.socket]);

    return (
        <div className="play">
            <div className="scores">
                <div className="score player1">{score.player1}</div>
                <div className="score -">-</div>
                <div className="score player2">{score.player2}</div>
            </div>
            <div className="game-area">
                <img className="player one" src={profil} alt='playerOne'/>
                <canvas ref={gameInstance.canvasRef} width={gameInstance.canvasWidth} height={gameInstance.canvasHeight} />
                <img className="player two" src={profil} alt='playerTwo'/>
            </div>
            <div className="spectatorsList">
                {spectators.map((spectator, index) => (
                    <img key={index} src={BoobaImg} alt={`Spectator ${spectator}`} className="spectator" />
                    ))}
            </div>
        </div>
    );
}