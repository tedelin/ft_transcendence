import { ClassGame } from './classGame';
import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { MatchHistory } from './matchHistory';
import { fetchUrl } from '../fetch';
import { useNavigate, Outlet } from 'react-router-dom';
import { useGame } from '../components/GameProvider';
import '../styles/page.css';
import { ThemeContext } from '../utils/providers/ThemeProvider';




export function Game() {
    const [showText, setShowText] = useState(false);
    const game = useGame();
    const auth = useAuth();
    const nav = useNavigate();
    const roomId = new URLSearchParams(window.location.search).get('roomId');
    const privateGame = new URLSearchParams(window.location.search).get('private');
    const { theme } = useContext(ThemeContext) as { theme: string };


    function handletsart() {
        auth?.socket?.emit('clickPlay');
        game?.setShowButton(false);
    }

    function handleInfoClick() {
        if (showText)
            setShowText(false);
        else
            setShowText(true);
    }

    useEffect(() => {
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
        fetchMatchHistory();
    }, []);

    function quitBack() {
        if (!game?.gameInstance.current) {
            auth?.socket?.emit('returnBack', { gameInstance: game?.gameInstance.current });
        }
        else if (game?.gameInstance.current) {
            auth?.socket?.emit('quitInGame');
            game?.handleQuit();
        }
    }

    useEffect(() => {
        auth?.socket?.on('gameMatchmaking', (data) => {
            if (data.firstPlayer) {
                game?.setFirstPlayer(true);
                if (!data.settingDone) {
                    game?.setSettingsToDo(true);
                    nav('/game/settings/ball');
                }
            }
            else
                nav('/game/matchmaking');
        })

        auth?.socket?.on('matchmakingStats', (data) => {
            game?.setPlayerOne(data.playerOne);
            game?.setPlayerTwo(data.playerTwo);
        })

        auth?.socket?.on('gameLaunch', (data) => {
            if (game != null && !game.gameStarted) {
                game.gameInstance.current = new ClassGame(React.createRef(), data.gameState, auth?.socket, { width: 800, height: 600 }, theme === 'dark' ? 'white' : 'dark');
                game.setGameStarted(true);
                game.setSettingsToDo(false);
                nav('/game/inGame');
            }
        });

        auth?.socket?.on('gameFinishedShowStats', (data) => {
            game?.setWinner(data.winner);
            game?.setPlayerStats(data.stats);
            game?.setIsAbandon(data.isAbandon);
            game?.setIsSpectator(data.isSpectator);
            game?.setShowEndGameModal(true);
            nav('/game/endGame');
        })

        auth?.socket?.on('backToMenu', () => {
            game?.setShowButton(true);
            game?.setSettingsToDo(false);
            game?.setFirstPlayer(false);
            game?.setPlayerOne([]);
            game?.setPlayerTwo([]);
        })

        auth?.socket?.on('letsGO', () => {
            nav('/game/matchmaking');
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

    useEffect(() => {
        if (window.location.pathname === '/game') {
            const previousUrl = game?.PreviousUrl;
            if (previousUrl?.includes('game/settings') || previousUrl?.includes('/matchmaking')) {
                auth?.socket?.emit('crossMatchmaking');
            }
            else
                auth?.socket?.emit('quitInGame');
            game?.handleQuit();
        }
    }, [window.location.pathname]);

    useEffect(() => {
        if (privateGame) {
            auth?.socket?.emit('inviteToPlay', parseInt(privateGame));
            game?.setShowButton(false);

        } else if (roomId) {
            auth?.socket?.emit('acceptInvite', roomId);
            game?.setShowButton(false);

        }
    }, [privateGame, roomId]);


    return (
        <div className='page'>
            {!game?.gameStarted && game?.showButton && game?.historyAll && (
                <div className="menu">
                    <div className='information_rules' onClick={handleInfoClick}>
                        <span className="material-symbols-outlined">
                            info
                        </span>
                    </div>
                    <div className="loading-animation">
                        <div className="boxxx">
                            <div className='div_start_game'>
                                <div className='StartButton' onClick={handletsart}>Start Game</div>
                            </div>
                        </div>
                    </div>
                    <MatchHistory matchs={game?.historyAll} />
                </div>
            )}
            {showText && (
                <div className="overlay" onClick={handleInfoClick}>
                    <div className="centeredText">
                        <p>In the game of Pong, two players face off on a screen divided into two halves.
                            Each controls a paddle positioned on their side of the court. A ball bounces
                            between the paddles, and the goal is to prevent the ball from passing behind
                            your own paddle. When a player fails to return the ball successfully, the
                            opponent scores a point and gains the service for the next exchange. The first
                            player to reach 11 points wins the game.</p>
                    </div>
                </div>
            )}

            <Outlet />
        </div>
    )
}