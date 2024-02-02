import React from 'react';
import './game.css';

export function MatchItem({ key, match }) {
    return (
        <div className="match-item" key={key}>
            <div>{new Date(match.date).toLocaleString()}</div>
            <div>{match.player[0].username}</div>
            <div>{match.player[0].score}</div>
            <div>{match.player[1].score}</div>
            <div>{match.player[1].username}</div>
        </div>
    );
}