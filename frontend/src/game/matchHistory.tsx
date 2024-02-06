import React from 'react';
import { MatchItem } from './matchItem';
import './game.css';

export function MatchHistory( { matchs }) {
    const last10Matchs = matchs ? matchs.slice(-10) : [];
    last10Matchs.forEach(match => {
        console.log(`id: ${match.id}`);
        console.log(`Date: ${match.createdAt}`);
        match.players.forEach(player => 
            console.log(`Player : ${player.player.username}, Score: ${player.score}, Role: ${player.role}`));
        })
    return (
        <div className="matchs-menu">
            <div className="matchs-title">History</div>
            {last10Matchs.map((match) => (
                <MatchItem key={match.id} match={match} />
            ))}
            <button className='loadMore' onClick={() => {}}>Load more</button>
        </div>
    );
}