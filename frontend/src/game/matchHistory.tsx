import React from 'react';
import { useState } from 'react';
import { MatchItem } from './matchItem';
import './game.css';

export function MatchHistory( { matchs }) {
    // matchs.forEach(match => {
    //     console.log(newMatch );
    //     console.log(`id: ${match.id}`);
    //     console.log(`Date: ${match.createdAt}`);
    //     match.players.forEach(player => 
    //         console.log(`Player : ${player.player.username}, Score: ${player.score}, Role: ${player.role}`));
    //     })
    return (
        <div className="history-menu">
            <div className="matchs-title">History</div>
            <div className="matchs-menu">
            {matchs.map((match) => (
                <MatchItem key={match.id} match={match} />
            ))}
            {/* <button className='loadMore' onClick={() => {}}>Load more</button> */}
            </div>
        </div>
    );

}