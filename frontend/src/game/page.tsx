import { ClassGame } from './classGame';
import { useEffect } from 'react';
import { useState, useRef } from 'react';
// import socket from './socket';
import React from 'react';
import './game.css';
import { SettingsMenu } from './settingsMenu';
import { EndGameMenu } from './endGameMenu';
import { MatchmakingView } from './MatchmakingView';
import { useAuth } from '../components/AuthProvider';
import { MatchHistory } from './matchHistory';
import { fetchUrl } from '../fetch';
import { useNavigate, useLocation } from 'react-router-dom';
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
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [showButton, setShowButton] = useState(true);
    const [settingsToDo, setSettingsToDo] = useState(false);
    const [firstPlayer, setFirstPlayer] = useState(false);
    const [ballSpeed, setBallSpeed] = useState(5);
    const [paddleHeight, setPaddleHeight] = useState(200);
    const [paddleSpeed, setPaddleSpeed] = useState(5);
    const [increasedBallSpeed, setIncreasedBallSpeed] = useState(0.003);
    const [ballSize, setBallSize] = useState(15);
    const [Winner, setWinner] = useState(false);
    const gameInstance = useRef<ClassGame | null>(null);

    const [showEndGameModal, setShowEndGameModal] = useState(false);
    const [playerStats, setPlayerStats] = useState([]);
    const [isAbandon, setIsAbandon] = useState(false);
    const [letsGO, setLetsGO] = useState(false);

    const [playerOne, setPlayerOne] = useState([]);
    const [playerTwo, setPlayerTwo] = useState([]);

    const [historyAll, setHistoryAll] = useState([]);
    const [isNavigationAllowed, setIsNavigationAllowed] = useState(false);
    const [isSpectator, setIsSpectator] = useState(false);

    // const navigate = useNavigate();
    // const location = useLocation();
    const auth = useAuth();

    function handleQuit() {
        setLetsGO(false);
        setGameStarted(false);
        setGameEnded(true);
        setShowButton(true);
        setFirstPlayer(false);
        setSettingsToDo(false);
        setBallSpeed(5);
        setPaddleHeight(200);
        setPaddleSpeed(5);
        setIncreasedBallSpeed(0.003);
        setBallSize(15);
        setShowEndGameModal(false);
        setPlayerStats([]);
        setWinner(false);
        setPlayerOne([]);
        setPlayerTwo([]);
        setIsNavigationAllowed(false);
    }

    function handletsart() {
        auth?.socket?.emit('clickPlay');
        setShowButton(false);
        setGameEnded(false);
        setIsNavigationAllowed(true);
        // navigate(`/game`, { state : { phase : 'gameok' } });
    }

    function handleSaveSettings() {
        console.log('ballSpeed : ' + ballSpeed);
        auth?.socket?.emit('clickSaveSettings', {
            ballSpeed: ballSpeed,
            paddleSpeed: paddleSpeed,
            paddleHeight: paddleHeight,
            ballSize: ballSize,
            increasedBallSpeed: increasedBallSpeed
        });
        setSettingsToDo(false);
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
        // Définition de la fonction asynchrone pour récupérer les matchs
        const fetchMatchHistory = async () => {
            try {
                const data = await fetchUrl('/game/history', {
                    method: "GET"
                });
                setHistoryAll(data);
            } catch (error) {
                console.error("Failed to fetch match history:", error);
            }
        };
        console.log("fetMatchHistory")
        fetchMatchHistory();
    }, []);

    // useEffect(() => {
    //     console.log("yo");
    //     console.log(`location : ${location.pathname}, isNavAllowed : ${isNavigationAllowed}, state: ${location.state}`)
    //     if (!isNavigationAllowed && location.pathname.includes('/game') && location.state) {
    //         console.log("Navigation non autorisée détectée, retour à /game");
    //         // navigate('/game', { state: null, replace: true });
    //     }
    //     if (isNavigationAllowed &&
    //         location.pathname === '/game' 
    //         && !location.state) {
    //         console.log("on sort");
    //         if (!showButton && !gameStarted)
    //         {
    //             auth?.socket?.emit('crossMatchmaking');
    //             setIsNavigationAllowed(false);
    //         }
    //         else if (gameStarted)
    //         {
    //             auth?.socket?.emit('quitInGame');
    //             handleQuit();
    //             setIsNavigationAllowed(false);
    //         }
    //         return ;
    //     }
    // }, [location.state]);

    function quitBack() {
        console.log(`showButton : ${showButton}, game: ${gameStarted}`);
        console.log(`${letsGO}, ${playerOne}`)
        console.log(`gameCurrent: ${gameInstance.current}`);
        if (!gameInstance.current)
        {
            auth?.socket?.emit('crossMatchmaking');
        }
        else if (gameInstance.current)
        {
            auth?.socket?.emit('quitInGame');
            handleQuit();
        }
    }

    useEffect(() => {
        auth?.socket?.on('gameMatchmaking', (data) => {
            if (data.firstPlayer) {
                setFirstPlayer(true);
                if (!data.settingDone)
                    setSettingsToDo(true);
            }
        })

        auth?.socket?.on('matchmakingStats', (data) => {
            setPlayerOne(data.playerOne);
            setPlayerTwo(data.playerTwo);
        })

        auth?.socket?.on('gameLaunch', (data) => {
            console.log('GameLaunch');
            if (!gameStarted) {
                gameInstance.current = new ClassGame(React.createRef(), data.gameState, auth?.socket);
                setGameStarted(true);
                setSettingsToDo(false);
            }
        })

        auth?.socket?.on('gameFinishedShowStats', (data) => {
            setWinner(data.winner);
            setPlayerStats(data.stats);
            setIsAbandon(data.isAbandon);
            setIsSpectator(data.isSpectator);
            setShowEndGameModal(true);
        })

        auth?.socket?.on('backToMenu', () => {
            setShowButton(true);
            setSettingsToDo(false);
            setFirstPlayer(false);
            setPlayerOne([]);
            setPlayerTwo([]);
        })

        auth?.socket?.on('letsGO', () => {
            setLetsGO(true);
        })

        auth?.socket?.on('matchs', (data) => {
            setHistoryAll(data);
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

    // useDetectNavigation(showButton, gameStarted, auth, handleQuit, navigate);

    return (
        <div className="game">
            {!gameStarted && showButton && historyAll && (
                <>
                    <button className='StartButton' onClick={handletsart}>Start Game</button>
                    <MatchHistory matchs={historyAll} />
                </>
            )}
            {!gameStarted && !showButton && settingsToDo && (
                <>
                    <div className='CrossIcon' onClick={() => {
                        auth?.socket?.emit('crossMatchmaking');
                        // navigate('/game');
                        }}>&#10006;</div>
                    <MatchmakingView
                        playerOne={playerOne}
                        playerTwo={playerTwo}
                    />
                    <SettingsMenu
                        ballSpeed={ballSpeed}
                        setBallSpeed={setBallSpeed}
                        ballSize={ballSize}
                        setBallSize={setBallSize}
                        paddleHeight={paddleHeight}
                        setPaddleHeight={setPaddleHeight}
                        paddleSpeed={paddleSpeed}
                        setPaddleSpeed={setPaddleSpeed}
                        increasedBallSpeed={increasedBallSpeed}
                        setIncreasedBallSpeed={setIncreasedBallSpeed}
                        onSaveSettings={handleSaveSettings}
                    />
                </>
            )}
            {!gameStarted && !showButton && !settingsToDo && (
                <>
                    <div className='CrossIcon' onClick={() => {
                        auth?.socket?.emit('crossMatchmaking');
                        // navigate('/game');
                        }}>&#10006;</div>
                    <MatchmakingView
                        playerOne={playerOne}
                        playerTwo={playerTwo}
                    />
                    {!letsGO && (
                        <div className="matchmaking-container">
                            <div className="matchmaking-animation"></div>
                            <div className="matchmaking-text">
                                {firstPlayer ? 'Waiting for another player...' : 'Waiting for the other player to set the game...'}
                            </div>
                        </div>
                    )}
                    {letsGO && (
                        <div className="matchmaking-container">
                            <span className="letsgo">Let's GO !</span>
                            <Countdown />
                        </div>
                    )}
                </>
            )}
            {gameStarted && gameInstance.current && (
                <StartGame gameInstance={gameInstance.current} />
            )}
            {gameStarted && !showEndGameModal && gameInstance.current && (
                <>
                    <div className='CrossIcon' onClick={() => {
                        auth?.socket?.emit('quitInGame');
                        handleQuit();
                        // navigate('/game');
                    }} >&#10006;</div>
                </>
            )}
            {showEndGameModal && (
                <EndGameMenu
                    Winner={Winner}
                    isAbandon={isAbandon}
                    playerStats={playerStats}
                    isSpect={isSpectator}
                    onQuit={handleQuit}
                />
            )}
        </div>
    );
}
