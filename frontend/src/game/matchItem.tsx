import React from 'react';
import './game.css';
import eyeIcon from './streaming.png';
import { useAuth } from '../components/AuthProvider';

export function MatchItem({ match }) {
    const auth = useAuth(); // Utilisez useAuth pour accéder à auth

    const playerPhotoUrl = 'https://static-cdn.jtvnw.net/jtv_user_pictures/1423d0d6-ce51-4cd7-92e6-005832cc1408-profile_image-300x300.png';

    const viewMatch = () => {
        auth?.socket?.emit('viewMatch', { userId: match.players[0].player.id });
    };
    const truncateUsername = (username) => {
        return username.length > 10 ? `${username.substring(0,8)}...` : username;
    };

    return (
        <div className="match-item">
            <div className="name">{truncateUsername(match.players[0].player.username)}</div>
            <img src={playerPhotoUrl} alt="Player" className="playerPhoto"/>
            <div className="middle-history-menu">
                {match.status === "FINISHED" ? (
                    <span className="score">{match.players[0].score} - {match.players[1].score}</span>
                    ) : (
                        <button className="view-match-button"  onClick={viewMatch}>
                    <img src={eyeIcon} alt="View Match" style={{width: '50px', height: '50px'}}/>
                    </button>
                )}
            </div>
            <img src={playerPhotoUrl} alt="Player" className="playerPhoto"/>
            <div className="name">{truncateUsername(match.players[1].player.username)}</div>
        </div>
    );
}