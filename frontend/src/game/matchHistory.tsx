import React from 'react';
import { MatchItem } from './matchItem';
import './game.css';

export function MatchHistory( { matchs }) {
    if (matchs)
    {
        matchs.forEach(match => {
            console.log(`Date: ${match.date}`);
            match.players.forEach(player => {
                console.log(`Player : ${player.username}, Score: ${player.score}, Role: ${player.role}`);
            })
        });
    }
    return (
        <div className="matchs-menu">
            {matchs && matchs.map((match, index) => (
                <MatchItem key={index} match={match} />
            ))}
        </div>
    );
}