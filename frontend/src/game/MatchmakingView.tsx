import React from 'react';
import './game.css';
import './matchmaking.css';
import projectLogo from './logo.png';
import profil from './profil.jpeg';

export function MatchmakingView({ playerOne, playerTwo }) {

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

    const backgroundStyleOne = (playerOne ? {
        backgroundImage: getBackgroundImageUrl(playerOne),
        backgroundSize: 'cover', 
        backgroundPosition: 'center'
    } : null);

    const backgroundStyleTwo = (playerTwo ? {
        backgroundImage: getBackgroundImageUrl(playerTwo),
        backgroundSize: 'cover', 
        backgroundPosition: 'center'
    } : null);

    const backOne = (playerOne ? 'backOne' : '');
    const backTwo = (playerTwo ? 'backTwo' : '');

    const classNameOne = (playerOne ? 'leftPlayer back' : 'leftPlayer');
    const classNameTwo = (playerTwo ? 'rightPlayer back' : 'rightPlayer');

    return (
        <div> 
            <div className="mmConteneur2">
                <img src={projectLogo} alt="Logo" className="logo" />
            </div>
            <div className="mmConteneur">
                <div className={backOne} style={backgroundStyleOne}>
                    <div className={classNameOne}>
                        {renderPlayer(playerOne, true)}
                    </div>
                </div>
                <div className={backTwo} style={backgroundStyleTwo}>
                    <div className={classNameTwo}>
                        {renderPlayer(playerTwo, false)}
                    </div>
                </div>
            </div>
        </div>
    );
}