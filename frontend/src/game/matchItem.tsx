import React from 'react';
import '../styles/chat.css';
import eyeIcon from './oeil.jpg';
import { useAuth } from '../components/AuthProvider';

export function MatchItem({ match }) {
    const auth = useAuth(); // Utilisez useAuth pour accéder à auth

    const viewMatch = () => {
        auth?.socket?.emit('viewMatch', { userId: match.players[0].player.id });
    };

    return (
        <div className="match-item">
            <div>{new Date(match.createdAt).toLocaleString()}</div>
            <div>{match.players[0].player.username}</div>
            {match.status === "FINISHED" ? (
                <span>{match.players[0].score} VS {match.players[1].score}</span>
            ) : (
                <button className="view-match-button"  onClick={viewMatch}>
                   <img src={eyeIcon} alt="View Match" style={{width: '20px', height: '20px'}}/>
                </button>
            )}
            <div>{match.players[1].player.username}</div>
        </div>
    );
}