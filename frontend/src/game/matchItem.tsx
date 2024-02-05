import React from 'react';
import './game.css';

export function MatchItem({ match }) {
    return (
        <div className="match-item">
            <div>{new Date(match.date).toLocaleString()}</div>
            <div>{match.players[0].username}</div>
            <div>{match.players[0].score}</div>
            <div>{match.players[1].score}</div>
            <div>{match.players[1].username}</div>
        </div>
    );
}