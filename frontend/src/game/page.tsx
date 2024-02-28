import { ClassGame } from './classGame';
import { useEffect } from 'react';
import { useState, useRef } from 'react';
// import socket from './socket';
import React from 'react';
import '../styles/game.css';    
import { SettingsMenu } from './settingsMenu';
import { EndGameMenu } from './endGameMenu';
import { MatchmakingView } from './MatchmakingView';
import { useAuth } from '../components/AuthProvider';
import { MatchHistory } from './matchHistory';
import { fetchUrl } from '../fetch';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useGame } from '../components/GameProvider';
// import { useError } from '../components/ErrorProvider';

function StartGame({ gameInstance }) {
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

        return () => {
            document.removeEventListener("keydown", gameInstance.handleKeyDown);
            document.removeEventListener("keyup", gameInstance.handleKeyUp);
        };
    }, [gameInstance]);


    return (
        <div className="canva">
            <canvas ref={gameInstance.canvasRef} width={gameInstance.canvasWidth} height={gameInstance.canvasHeight}></canvas>
        </div>
    );
}

export function Game() {
    const game = useGame();
    // const [gameStarted, setGameStarted] = useState(false);
    // const [showButton, setShowButton] = useState(true);
    // const [settingsToDo, setSettingsToDo] = useState(false);
    // const [firstPlayer, setFirstPlayer] = useState(false);
    // const [ballSpeed, setBallSpeed] = useState(5);
    // const [paddleHeight, setPaddleHeight] = useState(200);
    // const [paddleSpeed, setPaddleSpeed] = useState(5);
    // const [increasedBallSpeed, setIncreasedBallSpeed] = useState(0.003);
    // const [ballSize, setBallSize] = useState(15);
    // const [Winner, setWinner] = useState(false);
    // const gameInstance = useRef<ClassGame | null>(null);

    // const [showEndGameModal, setShowEndGameModal] = useState(false);
    // const [playerStats, setPlayerStats] = useState([]);
    // const [isAbandon, setIsAbandon] = useState(false);
    // const [letsGO, setLetsGO] = useState(false);

    // const [playerOne, setPlayerOne] = useState([]);
    // const [playerTwo, setPlayerTwo] = useState([]);

    // const [historyAll, setHistoryAll] = useState([]);
    // const [isSpectator, setIsSpectator] = useState(false);

    const auth = useAuth();

    function handleQuit() {
        game?.setLetsGO(false);
        game?.setGameStarted(false);
        game?.setShowButton(true);
        game?.setFirstPlayer(false);
        game?.setSettingsToDo(false);
        game?.setBallSpeed(5);
        game?.setPaddleHeight(200);
        game?.setPaddleSpeed(5);
        game?.setIncreasedBallSpeed(0.003);
        game?.setBallSize(15);
        game?.setShowEndGameModal(false);
        game?.setPlayerStats([]);
        game?.setWinner(false);
        game?.setPlayerOne([]);
        game?.setPlayerTwo([]);
    }

    function handletsart() {
        auth?.socket?.emit('clickPlay');
        game?.setShowButton(false);
    }

    function handleSaveSettings() {
        console.log('ballSpeed : ' + game?.ballSpeed);
        auth?.socket?.emit('clickSaveSettings', {
            ballSpeed: game?.ballSpeed,
            paddleSpeed: game?.paddleSpeed,
            paddleHeight: game?.paddleHeight,
            ballSize: game?.ballSize,
            increasedBallSpeed: game?.increasedBallSpeed
        });
        game?.setSettingsToDo(false);
    }

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

    useEffect(() => {
        console.log("settingToDo du front : " + game?.settingsToDo);
        if (game?.settingsToDo)
        else
    }, [game?.settingsToDo]);

    useEffect(() => {
        // Définition de la fonction asynchrone pour récupérer les matchs
        const fetchMatchHistory = async () => {
            try {
                const data = await fetchUrl('/game/history', {
                    method: "GET"
                });
                game?.setHistoryAll(data);
            } catch (error) {
                console.error("Failed to fetch match history:", error);
            }
        };
        console.log("fetMatchHistory")
        fetchMatchHistory();
    }, []);

    function quitBack() {
        console.log(`showButton : ${game?.showButton}, game: ${game?.gameStarted}`);
        console.log(`${game?.letsGO}, ${game?.playerOne}`)
        console.log(`gameCurrent: ${game?.gameInstance.current}`);
        if (!game?.gameInstance.current)
        {
            auth?.socket?.emit('returnBack', { gameInstance: game?.gameInstance.current });
        }
        else if (game?.gameInstance.current)
        {
            auth?.socket?.emit('quitInGame');
            handleQuit();
        }
    }

    useEffect(() => {
        auth?.socket?.on('gameMatchmaking', (data) => {
            if (data.firstPlayer) {
                game?.setFirstPlayer(true);
                if (!data.settingDone)
                game?.setSettingsToDo(true);
            }
        })

        auth?.socket?.on('matchmakingStats', (data) => {
            game?.setPlayerOne(data.playerOne);
            game?.setPlayerTwo(data.playerTwo);
        })

        auth?.socket?.on('gameLaunch', (data) => {
            console.log('GameLaunch');
            if (game != null && !game.gameStarted) {
                game.gameInstance.current = new ClassGame(React.createRef(), data.gameState, auth?.socket);
                game.setGameStarted(true);
                game.setSettingsToDo(false);
            }
        });

        auth?.socket?.on('gameFinishedShowStats', (data) => {
            game?.setWinner(data.winner);
            game?.setPlayerStats(data.stats);
            game?.setIsAbandon(data.isAbandon);
            game?.setIsSpectator(data.isSpectator);
            game?.setShowEndGameModal(true);
        })

        auth?.socket?.on('backToMenu', () => {
            game?.setShowButton(true);
            game?.setSettingsToDo(false);
            game?.setFirstPlayer(false);
            game?.setPlayerOne([]);
            game?.setPlayerTwo([]);
        })

        auth?.socket?.on('letsGO', () => {
            game?.setLetsGO(true);
        })

        auth?.socket?.on('matchs', (data) => {
            game?.setHistoryAll(data);
        })

        return () => {
            auth?.socket?.off('gameLaunch');
            auth?.socket?.off('gameMatchmaking');
            auth?.socket?.off('backToMenu');
            auth?.socket?.off('gameFinishedShowStats');
            auth?.socket?.off('letsGO');
            auth?.socket?.off('matchs');
            auth?.socket?.off('matchmakingStats');
            quitBack();
        }
    }, []);

    return (
        <div>
            {!game?.gameStarted && game?.showButton && game?.historyAll && (
                <>
                    {/* <button className='StartButton' onClick={handletsart}>Start Game</button> */}
                    <Link to="/game/settings" className='StartButton' onClick={handletsart}>Start Game</Link>
                    <MatchHistory matchs={game?.historyAll} />
                    <Link to="/game/matchmaking" className='StartButton' onClick={handletsart}>Start Game match</Link>

                </>
            )}
            <Outlet />
        </div>
    )
    // useDetectNavigation(showButton, gameStarted, auth, handleQuit, navigate);

    // return (
    //     <div className="game">
    //         {!gameStarted && showButton && historyAll && (
    //             <>
    //                 <button className='StartButton' onClick={handletsart}>Start Game</button>
    //                 <MatchHistory matchs={historyAll} />
    //             </>
    //         )}
    //         {!gameStarted && !showButton && settingsToDo && (
    //             <>
    //                 <div className='CrossIcon' onClick={() => {
    //                     auth?.socket?.emit('crossMatchmaking');
    //                     // navigate('/game');
    //                     }}>&#10006;</div>
    //                 <MatchmakingView
    //                     playerOne={playerOne}
    //                     playerTwo={playerTwo}
    //                 />
    //                 <SettingsMenu
    //                     ballSpeed={ballSpeed}
    //                     setBallSpeed={setBallSpeed}
    //                     ballSize={ballSize}
    //                     setBallSize={setBallSize}
    //                     paddleHeight={paddleHeight}
    //                     setPaddleHeight={setPaddleHeight}
    //                     paddleSpeed={paddleSpeed}
    //                     setPaddleSpeed={setPaddleSpeed}
    //                     increasedBallSpeed={increasedBallSpeed}
    //                     setIncreasedBallSpeed={setIncreasedBallSpeed}
    //                     onSaveSettings={handleSaveSettings}
    //                 />
    //             </>
    //         )}
    //         {!gameStarted && !showButton && !settingsToDo && (
    //             <>
    //                 {!letsGO && <div className='CrossIcon' onClick={() => {
    //                     auth?.socket?.emit('crossMatchmaking');
    //                     }}>&#10006;</div>}
    //                 <MatchmakingView
    //                     playerOne={playerOne}
    //                     playerTwo={playerTwo}
    //                 />
    //                 {!letsGO && (
    //                     <div className="matchmaking-container">
    //                         <div className="matchmaking-animation"></div>
    //                         <div className="matchmaking-text">
    //                             {firstPlayer ? 'Waiting for another player...' : 'Waiting for the other player to set the game...'}
    //                         </div>
    //                     </div>
    //                 )}
    //                 {letsGO && (
    //                     <div className="matchmaking-container">
    //                         <span className="letsgo">Let's GO !</span>
    //                         <Countdown />
    //                     </div>
    //                 )}
    //             </>
    //         )}
    //         {gameStarted && gameInstance.current && (
    //             <StartGame gameInstance={gameInstance.current} />
    //         )}
    //         {gameStarted && !showEndGameModal && gameInstance.current && (
    //             <>
    //                 <div className='CrossIcon' onClick={() => {
    //                     auth?.socket?.emit('quitInGame');
    //                     handleQuit();
    //                     // navigate('/game');
    //                 }} >&#10006;</div>
    //             </>
    //         )}
    //         {showEndGameModal && (
    //             <EndGameMenu
    //                 Winner={Winner}
    //                 isAbandon={isAbandon}
    //                 playerStats={playerStats}
    //                 isSpect={isSpectator}
    //                 onQuit={handleQuit}
    //             />
    //         )}
    //     </div>
    // );
}
