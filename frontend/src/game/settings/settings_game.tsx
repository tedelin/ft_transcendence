import '../../styles/chat.css';
import { useGame } from '../../components/GameProvider';
import { useAuth } from '../../components/AuthProvider';
import { Outlet, useNavigate } from 'react-router-dom';
import BlockBackNavigation from "../BlockBackNavigation";
import { useEffect } from 'react';
import '../../styles/gameSettings.css';
import { TopBar } from './topBar';
import { RightBar } from './rightBar';

export function Settings_game() {
    const game = useGame();
    const nav = useNavigate();
    const auth = useAuth();

    if(!game) return;

    useEffect(() => {
        if (game?.gameStarted || game?.showButton || !game?.settingsToDo) {
            nav('/game/');
        }
    }, [game]);

    const handleSaveSettings = () => {
        auth?.socket?.emit('clickSaveSettings', {
            ballSpeed: game?.ballSpeed,
            paddleSpeed: game?.paddleSpeed,
            paddleHeight: game?.paddleHeight,
            ballSize: game?.ballSize,
            increasedBallSpeed: game?.increasedBallSpeed
        });
        game?.setSettingsToDo(false);
    }

    game.PreviousUrl = window.location.pathname;

    return (
        <>
            < BlockBackNavigation />
            < TopBar />
            <div className='rowDirection'>
                < Outlet />
                < RightBar handleSaveSettings={handleSaveSettings}/>
            </div>
        </>
    );
}

