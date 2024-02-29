import React from 'react';
import './game.css';
import './end-game.css';
import profil from './profil.jpeg';

export function EndGameMenu({ Winner, isAbandon, playerStats, isSpect, onQuit }) {
    const winnerClass = Winner ? "img-winner wlaurier" : "img-winner wchapeau";

    return (
        <div className="endGameMenu">
            <div className="menuContent">
                <div className="end-scores">3 - 0</div>
                <div className="images-conteneur">
                    <div className={Winner || isSpect ? 'img laurier' : 'img chapeau'}>
                        <img src={profil} alt="profil" className={winnerClass} />
                    </div>
                </div>
                <div className="menu-footer">
                    <div className="sentence">
                    {/* {isSpect ? `${Winner} won${isAbandon ? " by abandon " : "!"}` : Winner ? `You won${isAbandon ? " by abandon" : "!"}`: "You lost !"} */}
                        {isSpect ? `${Winner} won ! 🥳` : Winner ? "You won ! 🥳" : "You lost...  🤡"}
                    </div>
                    <div className="menuButton" onClick={onQuit}>{">"}</div>
                </div>
            </div>
        </div>
    );
}