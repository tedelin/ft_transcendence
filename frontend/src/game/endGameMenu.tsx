import React from 'react';
import '../styles/chat.css';

export function EndGameMenu({ Winner, isAbandon, playerStats, isSpect, onQuit }) {
    return (
        <div className="endGameMenu">
            <div className="menuContent">
                <div className="menuHeader">
                    {isSpect ? `${Winner} won${isAbandon ? " by abandon " : "!"}` : Winner ? `You won${isAbandon ? " by abandon" : "!"}`: "You lost !"}
                </div>
                <div className="conteneur">
                    <div className="statsLine legend">
                        <div className="box id">    </div>
                        <div className="box wins">Victories</div>
                        <div className="box gamesPlayed">Total of games</div>
                        <div className="box id">{playerStats.player1.user.username}</div>
                        <div className="box wins">{playerStats.player1.nbWin}</div>
                        <div className="box gamesPlayed">{playerStats.player1.nbGames}</div>
                        <div className="box id">{playerStats.player2.user.username}</div>
                        <div className="box wins">{playerStats.player2.nbWin}</div>
                        <div className="box gamesPlayed">{playerStats.player2.nbGames}</div>
                    </div>
                </div>
                <button className="menuButton" onClick={onQuit}>Quit</button>
            </div>
        </div>
    );
}