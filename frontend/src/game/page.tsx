import { ClassGame } from './classGame';
import { useEffect } from 'react';
import { useState, useRef } from 'react';
import socket from '../socket';
import React from 'react';
import './game.css';
import { SettingsMenu } from './settingsMenu';
import { EndGameMenu } from './endGameMenu';
import { MatchmakingView } from './MatchmakingView';

function StartGame({ gameInstance }) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                socket.emit('keyAction', { key: event.key, action: 'pressed' });
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                socket.emit('keyAction', { key: event.key, action: 'released' });
            }
        };

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
    }

    function handletsart() {
        socket.emit('clickPlay');
        setShowButton(false);
        setGameEnded(false);
    }

    function handleSaveSettings() {
        console.log('ballSpeed : ' + ballSpeed);
        socket.emit('clickSaveSettings', {
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

        socket.on('gameMatchmaking', (data) => {
            if (data.firstPlayer) {
                setFirstPlayer(true);
                if (!data.settingDone)
                    setSettingsToDo(true);
            }
        })

        socket.on('matchmakingStats', (data) => {
            setPlayerOne(data.playerOne);
            setPlayerTwo(data.playerTwo);
        })

        socket.on('gameLaunch', (data) => {
            console.log('GameLaunch');
            if (!gameStarted) {
                gameInstance.current = new ClassGame(React.createRef(), data.gameState);
                setGameStarted(true);
                setSettingsToDo(false);
            }
        })

        socket.on('gameFinishedShowStats', (data) => {
            setWinner(data.winner);
            setPlayerStats(data.stats);
            setIsAbandon(data.isAbandon);
            setShowEndGameModal(true);
        })

        socket.on('backToMenu', () => {
            setShowButton(true);
            setSettingsToDo(false);
            setFirstPlayer(false);
            setPlayerOne([]);
            setPlayerTwo([]);
        })

        socket.on('letsGO', () => {
            setLetsGO(true);
        })

        return () => {
            socket.off('gameLaunch');
            socket.off('gameMatchmaking');
            socket.off('backToMenu');
            socket.off('gameFinishedShowStats');
            socket.off('letsGO');
        }
    }, [gameStarted]);

    return (
        <div className="game">
            {!gameStarted && showButton && (
                <button className='StartButton' onClick={handletsart}>Start Game</button>
            )}
            {!gameStarted && !showButton && settingsToDo && (
                <>
                    <div className='CrossIcon' onClick={() => socket.emit('crossMatchmaking')}>&#10006;</div>
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
                    <div className='CrossIcon' onClick={() => socket.emit('crossMatchmaking')}>&#10006;</div>
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
                            <Countdown/>
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
                        socket.emit('quitInGame');
                        handleQuit();
                    }} >&#10006;</div>
                </>
            )}
            {showEndGameModal && (
                <EndGameMenu
                    Winner={Winner}
                    isAbandon={isAbandon}
                    playerStats={playerStats}
                    onQuit={handleQuit}
                />
            )}
        </div>
    );
}
