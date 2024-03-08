// import React from 'react';
// import '../styles/chat.css';
// import { useGame } from '../components/GameProvider';
// import { useAuth } from '../components/AuthProvider';
// import { useNavigate } from 'react-router-dom';

// export function MatchmakingView() {
//     const game = useGame();
//     const auth = useAuth();
//     const nav = useNavigate();
//     const renderPlayer = (player, isPlayerOne) => {
//         const defaultPhotoUrl = 'data:image/png;base64,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'; // URL de l'image par défaut
//         const playerPhotoUrl = 'https://static-cdn.jtvnw.net/jtv_user_pictures/1423d0d6-ce51-4cd7-92e6-005832cc1408-profile_image-300x300.png'

//         const photoUrl = player ? playerPhotoUrl : defaultPhotoUrl;
//         const playerName = player ? player.id : 'Waiting for player...';
//         const playerClass = player ? (isPlayerOne ? 'playerBlue' : 'playerRed') : 'player';

//         return (
//             <div className="playerInfo">
//                 {/* <p>salut c'est moi tchoupi</p> */}
//                 <img src={photoUrl} alt="Player" className="playerPhoto" />
//                 <span>
//                     {playerName}
//                 </span>
//             </div>
//         );
//     };



//     return (
//         <>
//             <div className='CrossIcon' onClick={() => {
//                 auth?.socket?.emit('crossMatchmaking');
//                 nav('/game');
//             }}>&#10006;</div>
//             <div className="leftPlayer">
//                 {renderPlayer(game?.playerOne, true)}
//             </div>
//             <div className="rightPlayer">
//                 {renderPlayer(game?.playerTwo, false)}
//             </div>
//         </>
//     );
// }


import React from 'react';
// import '../styles/game.css';
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