import { ClassGame } from './classGame';
import React, { useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { MatchHistory } from './matchHistory';
import { fetchUrl } from '../fetch';
import { useNavigate, Outlet } from 'react-router-dom';
import { useGame } from '../components/GameProvider';
import '../styles/page.css';



export function Game() {
    const game = useGame();
    const auth = useAuth();
    const nav = useNavigate();

    function handletsart() {
        auth?.socket?.emit('clickPlay');
        game?.setShowButton(false);
    }

    // useEffect(() => {
    //     console.log("settingToDo du front : " + game?.settingsToDo);
    // }, [game?.settingsToDo]);

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
        console.log("fetMatchHistory")
        fetchMatchHistory();
    }, []);

    function quitBack() {
        console.log(`showButton : ${game?.showButton}, game: ${game?.gameStarted}`);
        console.log(`${game?.letsGO}, ${game?.playerOne}`)
        console.log(`gameCurrent: ${game?.gameInstance.current}`);
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
            console.log('GameLaunch');
            if (game != null && !game.gameStarted) {
                game.gameInstance.current = new ClassGame(React.createRef(), data.gameState, auth?.socket, { width: 800, height: 600 });
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
			auth?.socket?.emit('crossMatchmaking');
			game?.handleQuit();
		}
	}, [window.location.pathname]);


    return (
        <div className='page'>
            {!game?.gameStarted && game?.showButton && game?.historyAll && (
                <div className="menu">
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
            <Outlet />
        </div>
    )
}