import ousama from '../../game_img/profil.jpeg';
import booba from '../../game_img/booba.jpeg';
import { useGame } from '../../components/GameProvider';
import { useEffect } from 'react';
import { getAvatar } from '../../utils/utils';
// import projectLogo from '../../game_img/logo.png';

export function TopBar() {
    const game = useGame();

    return (
        <div className='TopBar'>
            <div className='leftPlayerContainer'>
                <img className='leftPlayerImg' src={getAvatar(game?.playerOne?.avatar)} alt="la balaine" />
                <p className='playerName'>{game?.playerOne?.id}</p>
            </div>
            <div className='centerContainer'>
                <div className="loader">
                    <span className="loader__element"></span>
                    <span className="loader__element"></span>
                    <span className="loader__element"></span>
                </div>
            </div>
            <div className='rightPlayerContainer'>
            <img className='leftPlayerImg' src={getAvatar(game?.playerTwo?.avatar)} alt="la balaine" />
                <p className='playerName'>{game?.playerTwo?.id}</p>
            </div>
        </div>
    )
}