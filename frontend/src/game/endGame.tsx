import '../styles/game.css';
import '../styles/end-game.css';
import profil from './profil.jpeg';
import { useGame } from '../components/GameProvider';



export function EndGame() {
    const game = useGame();
    const winnerClass = game?.Winner ? "img-winner wlaurier" : "img-winner wchapeau";

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
    };

    return (
        <div className="endGameMenu">
            <div className="menuContent">
                <div className="end-scores">3 - 0</div>
                <div className="images-conteneur">
                    <div className={game?.Winner || game?.isSpectator ? 'img laurier' : 'img chapeau'}>
                        <img src={profil} alt="profil" className={winnerClass} />
                    </div>
                </div>
                <div className="menu-footer">
                    <div className="sentence">
                        {/* {isSpect ? `${Winner} won${isAbandon ? " by abandon " : "!"}` : Winner ? `You won${isAbandon ? " by abandon" : "!"}`: "You lost !"} */}
                        {game?.isSpectator ? `${game?.Winner} won ! 🥳` : game?.Winner ? "You won ! 🥳" : "You lost...  🤡"}
                    </div>
                    <div className="menuButton" onClick={handleQuit}>{">"}</div>
                </div>
            </div>
        </div>
    );
}