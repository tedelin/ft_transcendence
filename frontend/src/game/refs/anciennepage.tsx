"use client";

import { classGame } from '../classGame';
import { useEffect } from 'react';
import { useState } from 'react';
import { io } from 'socket.io-client';
import socket from '../socket';
import React from 'react';
import './game.css';

function StartGame({ gameInstance }) {
    useEffect(() => {
        gameInstance.startGame();

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

export default function Game() {
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [winner, setWinner] = useState(false);
    const [ballSpeed, setBallSpeed] = useState(3);
    const [paddleHeight, setPaddleHeight] = useState(200);
    const [paddleSpeed, setPaddleSpeed] = useState(5);
    const [increasedBallSpeed, setIncreasedBallSpeed] = useState(0.001);
    const [ballSize, setBallSize] = useState(15);

    const [winMessage, setWinMessage] = useState('');
    let [showButton, setShowButton] = useState(true);
    const [settingsToDo, setSettingsToDo] = useState(false);
    const [firstPlayer, setFirstPlayer] = useState(false);


    // RENDERING IN FONCTION OF 
    const gameInstance = new classGame(ballSpeed, paddleHeight, paddleSpeed, increasedBallSpeed, ballSize, firstPlayer);

    function endGame(winner: boolean) {
        setGameStarted(false);
        setGameEnded(true);
        setShowButton(true);
        console.log(`won ? : ${winner}`);
        if (winner)
            setWinMessage('You won ! :)');
        else
            setWinMessage('You lost ! :(');
        setWinner(false);
        setFirstPlayer(false);
        setSettingsToDo(false);
    }

    function handleStart() {
        socket.emit('clickPlay', '');
        setShowButton(false);
        setGameEnded(false);
    }

    function handleSaveSettings() {
        socket.emit('clickSaveSettings', {
            ballSpeed: ballSpeed,
            paddleSpeed: paddleSpeed,
            paddleHeight: paddleHeight,
            ballSize: ballSize,
            increasedBallSpeed: increasedBallSpeed
        });
        setSettingsToDo(false);
    }

    function handleCrossGame() {
        socket.emit('crossGame', '');
    }

    function handleCrossMatchmaking() {
        console.log("handlecrossMatchMaking");
        socket.emit('crossSetting', '');
    }

    // GAME COMMUNICATION WHILE PLAYING HANDLED HERE
    useEffect(() => {

        socket.on('gameSetting', (data) => {
            console.log('gameSetting');
            console.log('first ? ' + data.firstPlayer);
            console.log('sett done ? ' + data.settingDone);
            if (data.firstPlayer) {
                setFirstPlayer(true);
                console.log('there is a first player here');
                if (!data.settingDone)
                    setSettingsToDo(true);
            }
        })

        socket.on('gameLaunch', (data) => {
            if (data.launch) {
                setBallSpeed(data.settings.ballSpeed);
                setPaddleHeight(data.settings.paddleHeight);
                setPaddleSpeed(data.settings.paddleSpeed);
                setIncreasedBallSpeed(data.settings.increasedBallSpeed);
                setBallSize(data.settings.ballSize);
                setGameStarted(true);
                setSettingsToDo(false);
            }
        });

        socket.on('gameExit', (data) => {
            console.log('gameExitttttttttttttttttttttt');
            if (data.exit === true)
                endGame(data.winner);
        })

        socket.on('backToMenu', () => {
            setShowButton(true);
            setSettingsToDo(false);
            setFirstPlayer(false);
        })

        return () => {
            socket.off('gameLaunch');
            socket.off('gameExit');
            socket.off('gameSetting');
        }
    },);

    // SETTINGS HTML
    const renderSettingsMenu = () => (
        <div className='settingsMenu'>
            <p style={{ margin: '20px', textAlign: 'center', textDecoration: 'underline', fontSize: '25px' }}>Settings</p>

            <div className="settingRow">
                <div className='label'>
                    <label htmlFor="ballSpeed">Ball Speed :</label>
                </div>
                <div className='input'>
                    <input
                        type="range"
                        id="ballSpeed"
                        min="1"
                        max="10"
                        step="1"
                        value={ballSpeed}
                        onChange={(e) => setBallSpeed(parseInt(e.target.value))}
                    />
                </div>
                <div className='number'>
                    <span>{ballSpeed}</span>
                </div>
            </div>

            <div className="settingRow">
                <div className='label'>
                    <label htmlFor="BallSize">Ball Size :</label>
                </div>
                <div className='input'>
                    <input
                        type="range"
                        id='ballSize'
                        min='5'
                        max='30'
                        step='1'
                        value={ballSize}
                        onChange={(e) => setBallSize(parseInt(e.target.value))}
                    />
                </div>
                <div className='number'>
                    <span>{ballSize}</span>
                </div>
            </div>

            <div className='settingRow'>
                <div className='label'>
                    <label htmlFor="increasedBallSpeed">Increased Ball Speed/s :</label>
                </div>
                <div className='input'>
                    <input
                        type="range"
                        id="increasedBallSpeed"
                        min="0.001"
                        max="0.010"
                        step="0.001"
                        value={increasedBallSpeed}
                        onChange={(e) => setIncreasedBallSpeed(parseFloat(e.target.value))}
                    />
                </div>
                <div className='number'>
                    <span>{increasedBallSpeed}</span>
                </div>
            </div>

            <div className="settingRow">
                <div className='label'>
                    <label htmlFor="paddleHeight">Paddle Height :</label>
                </div>
                <div className='input'>
                    <input
                        type="range"
                        id="paddleHeight"
                        min="100"
                        max="300"
                        step="1"
                        value={paddleHeight}
                        onChange={(e) => setPaddleHeight(parseInt(e.target.value))}
                    />
                </div>
                <div className='number'>
                    <span>{paddleHeight}</span>
                </div>
            </div>

            <div className="settingRow">
                <div className='label'>
                    <label htmlFor="paddleSpeed">Paddle Speed :</label>
                </div>
                <div className='input'>
                    <input
                        type="range"
                        id="paddleSpeed"
                        min="1"
                        max="10"
                        step="1"
                        value={paddleSpeed}
                        onChange={(e) => setPaddleSpeed(parseInt(e.target.value))}
                    />
                </div>
                <div className='number'>
                    <span>{paddleSpeed}</span>
                </div>
            </div>
            <div className='buttonContainer'>
                <button className='SettingsButton' onClick={handleSaveSettings}>Save</button>
            </div>
        </div>
    );

    return (
        <div>
            {!gameStarted && showButton && (
                <button className='StartButton' onClick={handleStart}>Start Game</button>
            )}
            {!gameStarted && !showButton && settingsToDo && (
                <>
                    <div className='CrossIcon' onClick={handleCrossMatchmaking}>&#10006;</div>
                    {renderSettingsMenu()}
                </>
            )}
            {!gameStarted && !showButton && !settingsToDo && (
                <div>
                    <div className='CrossIcon' onClick={handleCrossMatchmaking}>&#10006;</div>
                    <div className="matchmaking-container">
                        <div className="matchmaking-animation"></div>
                        <div className="matchmaking-text">
                            {firstPlayer ? 'Waiting for another player...' : 'Waiting for the other player to set the game...'}
                        </div>
                    </div>
                </div>
            )}
            {gameStarted && (
                <>
                    <div className='CrossIcon' onClick={handleCrossGame}>&#10006;</div>
                    <StartGame gameInstance={gameInstance} />
                </>
            )}
            {!gameStarted && gameEnded && (
                <div className='winner'>{winMessage}</div>
            )}
        </div>
    );
}
