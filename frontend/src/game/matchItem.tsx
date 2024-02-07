import React from 'react';
import './game.css';
import eyeIcon from './oeil.jpg';

export function MatchItem({ match }) {
    return (
        <div className="match-item">
            <div>{new Date(match.createdAt).toLocaleString()}</div>
            <div>{match.players[0].player.username}</div>
            {match.status === "FINISHED" ? (
                <span>{match.players[0].score} VS {match.players[1].score}</span>
            ) : (
                <button className="view-match-button"  onClick={() => console.log('View match clicked')}>
                   <img src={eyeIcon} alt="View Match" style={{width: '20px', height: '20px'}}/>
                </button>
            )}
            <div>{match.players[1].player.username}</div>
        </div>
    );
}