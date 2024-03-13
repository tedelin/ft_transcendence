import { useEffect } from 'react';
import { useState } from 'react';
import '../styles/game.css';
import '../styles/button.css';
import '../styles/matchmaking.css'
import { useAuth } from '../components/AuthProvider';
import { useGame } from '../components/GameProvider';
import { useNavigate } from 'react-router-dom';
import profil from '../game_img/profil.jpeg';
import boobaprofil from '../game_img/booba.jpeg';
import BlockBackNavigation from "./BlockBackNavigation";


export function InGame() {
    const game = useGame();
    const auth = useAuth();
    const nav = useNavigate();
    const [score, setScore] = useState({ player1: 0, player2: 0 });
    const [spectators, setSpectators] = useState(game?.spectatorsBase);

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
        game?.gameInstance?.current?.startGame();

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
            if (Array.isArray(data.spectators)) {
                setSpectators(data.spectators);
            } else {
                setSpectators([]);
            }
        });

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
            auth?.socket?.off('spectators');
            auth?.socket?.off('gameStateUpdate')
        };
    }, [game?.gameInstance, auth?.socket]);

    useEffect(() => {
        if (!game?.gameStarted || !game?.gameInstance.current) {
            nav('/game/');
        }
    }, [game]);

    return (
        <>
            {game?.gameStarted && game?.gameInstance.current && (
                <div className="play">
                    <BlockBackNavigation />
                    <div className="scores">
                        <div className="score player1">{score.player1}</div>
                        <div className="score -">-</div>
                        <div className="score player2">{score.player2}</div>
                    </div>
                    <div className="game-area">
                        <img className="player" src={profil} alt='playerOne' />
                        <canvas ref={game?.gameInstance.current?.canvasRef} width={game?.gameInstance?.current?.canvasWidth} height={game?.gameInstance?.current?.canvasHeight} />
                        <img className="player" src={profil} alt='playerTwo' />
                    </div>
                    <div className="spectatorsList">
                        {spectators?.map((spectator, index) => (
                            <img key={index} src={boobaprofil} alt={`Spectator ${spectator}`} className="spectator" />
						))}
                    </div>
                </div>
            )}
            {game?.gameStarted && !game?.showEndGameModal && game?.gameInstance.current && (
                <>
                    <div className='CrossIcon' onClick={() => {
                        auth?.socket?.emit('quitInGame');
                        game?.handleQuit();
                    }} >&#10006;</div>
                </>
            )}
        </>
    );
}