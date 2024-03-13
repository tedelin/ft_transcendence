import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { useGame } from "../components/GameProvider";
import { MatchHistory } from "./matchHistory";


export function Lobby() {
    const game = useGame();
    const auth = useAuth();
    const nav = useNavigate();

    function handletsart() {
        auth?.socket?.emit('clickPlay');
        game?.setShowButton(false);
        nav('/game/matchmaking');
    }

    return (
        <div className="menu">
            <div className="loading-animation">
                <div className="boxxx">
                    <div className='div_start_game'>
                        <div className='StartButton' onClick={handletsart}>Start Game</div>
                    </div>
                </div>
            </div>
            <MatchHistory matchs={game?.historyAll} />
        </div>
    );
}