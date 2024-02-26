import React from 'react';
import { useState } from 'react';
import { MatchItem } from './matchItem';
import './matchHistory.css';

export function MatchHistory( { matchs }) {
    return (
        <div className="history-menu">
            <div className="matchs-title">Match history</div>
            <div className="matchs-menu">
            {matchs.map((match) => (
                <MatchItem key={match.id} match={match} />
            ))}
            </div>
        </div>
    );

}