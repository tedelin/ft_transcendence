import '../styles/matchmaking.css';
import projectLogo from '../game_img/logo.png';
import { useGame } from '../components/GameProvider';
import { getAvatar } from '../utils/utils';


export function MatchmakingView() {

    const game = useGame();

    if (!game) return;

    game.PreviousUrl = window.location.href;

    const renderPlayer = (player) => {
        const avatar = getAvatar(player?.avatar);

        if (player) {
            return (
                <div className="playerInfo">
                    <img src={avatar} alt="Player" className="playerPhoto" />
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
        const avatar = getAvatar(player?.avatar);
        return `url(${avatar})`;
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
                        {renderPlayer(game?.playerOne)}
                    </div>
                </div>
                <div className={backTwo} style={backgroundStyleTwo || {}}>
                    <div className={classNameTwo}>
                        {renderPlayer(game?.playerTwo)}
                    </div>
                </div>
            </div>

        </div>
    );
}