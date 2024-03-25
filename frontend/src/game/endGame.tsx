import confetti from 'canvas-confetti';
// import { useStep } from './LayoutTwoFaSetup'
import '../styles/game.css';
import '../styles/end-game.css';
import { useGame } from '../components/GameProvider';
import { useNavigate } from 'react-router-dom';
import BlockBackNavigation from "./BlockBackNavigation";
import { useEffect } from 'react';
import { getAvatar } from '../utils/utils';
import { useAuth } from '../components/AuthProvider';


export function EndGame() {
    const game = useGame();
    const auth = useAuth();
    const me = auth?.user;
    const nav = useNavigate();
    const winnerClass = game?.Winner ? "img-winner wlaurier" : "img-winner wchapeau";

    useEffect(() => {
        if (!game?.showEndGameModal) {
            nav('/game/');
        }
    }, [game]);

	useEffect(() => {
        if (game?.Winner || game?.isSpectator) {
            confetti({
                particleCount: 1000,
                spread: 300,
                origin: { y: 0.5 }
            });
        }
    }, [game]);
    

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
        nav('/game');
    };

    let Myscore = me?.username === game?.playerOne.id ? game?.gameInstance?.current?.localState?.score.player1 : game?.gameInstance?.current?.localState?.score.player2;
    let OpponentScore = me?.username === game?.playerOne.id ? game?.gameInstance?.current?.localState?.score.player2 : game?.gameInstance?.current?.localState?.score.player1;
    if(Myscore === undefined) Myscore = 0;
    if(OpponentScore === undefined) OpponentScore = 0;
    return (
        <>
        {game?.showEndGameModal && (
            <div className="endGameMenu">
                <BlockBackNavigation />
                <div className="menuContent">
                    <div className="end-scores">{Myscore} - {OpponentScore}</div>
                    <div className="images-conteneur">
					<div className={game?.Winner || game?.isSpectator ? 'img laurier' : 'img chapeau'}>
                            <img src={getAvatar(game.isSpectator ? game?.Winner.avatar : me?.avatar)} alt="profil" className={winnerClass} />
                        </div>
                    </div>
                    <div className="menu-footer">
                        <div className="sentence">
                            {game?.isSpectator ? `${game?.Winner.username} won ! 🥳` : game?.Winner ? "You won ! 🥳" : "You lost...  🤡"}
                        </div>
                        <span className="material-symbols-outlined menuButton" onClick={handleQuit}>arrow_forward</span>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}