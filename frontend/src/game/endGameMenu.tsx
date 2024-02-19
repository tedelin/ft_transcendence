import React from 'react';
import './game.css';

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
                        <div className="box id">{playerStats.player1.id}</div>
                        <div className="box wins">{playerStats.player1.wins}</div>
                        <div className="box gamesPlayed">{playerStats.player1.gamesPlayed}</div>
                        <div className="box id">{playerStats.player2.id}</div>
                        <div className="box wins">{playerStats.player2.wins}</div>
                        <div className="box gamesPlayed">{playerStats.player2.gamesPlayed}</div>
                    </div>
                </div>
                <button className="menuButton" onClick={onQuit}>Quit</button>
            </div>
        </div>
    );
}