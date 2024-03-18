import '../styles/game.css';
import eyeIcon from '../game_img/streaming.png';
import { useAuth } from '../components/AuthProvider';
import { getAvatar } from '../utils/utils';
import { useGame } from '../components/GameProvider';

export function MatchItem({ match }) {
    const auth = useAuth();
    const game = useGame();

    
    const viewMatch = () => {
        game?.setIsSpectator(true);
        auth?.socket?.emit('viewMatch', { userId: match.players[0].player.id });
    };
    const truncateUsername = (username) => {
        return username.length > 10 ? `${username.substring(0, 8)}...` : username;
    };

    return (
        <div className="match-item">
            <div className="name">{truncateUsername(match.players[0].player.username)}</div>
            <img src={getAvatar(match.players[0].player.avatar)} alt="Player" className="playerPhoto" />
            <div className="middle-history-menu">
                {match.status === "FINISHED" ? (
                    <span className="score_history">{match.players[0].score} - {match.players[1].score}</span>
                ) : (
                    <button className="view-match-button" onClick={viewMatch}>
                        <img src={eyeIcon} alt="View Match" style={{ width: '50px', height: '50px' }} />
                    </button>
                )}
            </div>
            <img src={getAvatar(match.players[1].player.avatar)} alt="Player" className="playerPhoto" />
            <div className="name">{truncateUsername(match.players[1].player.username)}</div>
        </div>
    );
}