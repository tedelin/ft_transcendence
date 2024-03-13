import '../styles/matchmaking.css';
import projectLogo from '../game_img/logo.png';
import profil from '../game_img/profil.jpeg';
import { useGame } from '../components/GameProvider';

export function MatchmakingView() {

    const game = useGame();

    const renderPlayer = (player) => {
        if (player) {
            return (
                <div className="playerInfo">
                    <img src={profil} alt="Player" className="playerPhoto" />
                    <span>
                        {player.id}
                    </span>
                </div>
            );
        }
        return (
            <div className="playerInfo">
                <div className="loader">
                    <span className="loader__element"></span>
                    <span className="loader__element"></span>
                    <span className="loader__element"></span>
                </div>
            </div>
        );
    };

    const getBackgroundImageUrl = (player) => {
        return `url(${profil})`;
    };

    const backgroundStyleOne = (game?.playerOne ? {
        backgroundImage: getBackgroundImageUrl(game?.playerOne),
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    } : null);

    const backgroundStyleTwo = (game?.playerTwo ? {
        backgroundImage: getBackgroundImageUrl(game?.playerTwo),
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    } : null);

    const backOne = (game?.playerOne ? 'backOne' : '');
    const backTwo = (game?.playerTwo ? 'backTwo' : '');

    const classNameOne = (game?.playerOne ? 'leftPlayer back' : 'leftPlayer');
    const classNameTwo = (game?.playerTwo ? 'rightPlayer back' : 'rightPlayer');

    return (
        <div>
            <div className="mmConteneur2">
                <img src={projectLogo} alt="Logo" className="logo" />
            </div>
            <div className="mmConteneur">
                <div className={backOne} style={backgroundStyleOne || {}}>
                    <div className={classNameOne}>
                        {renderPlayer(game.playerOne)}
                    </div>
                </div>
                <div className={backTwo} style={backgroundStyleTwo || {}}>
                    <div className={classNameTwo}>
                        {renderPlayer(game.playerTwo)}
                    </div>
                </div>
            </div>

        </div>
    );
}