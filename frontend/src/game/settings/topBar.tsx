import { useGame } from '../../components/GameProvider';
import { getAvatar } from '../../utils/utils';

export function TopBar() {
    const game = useGame();
    const avatarPlayerTwo = game?.playerTwo ? getAvatar(game?.playerTwo?.avatar) : "";
    const idPlayerTwo = game?.playerTwo ? game?.playerTwo?.id : "";

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
            {avatarPlayerTwo != "" &&
                <div className='rightPlayerContainer'>
                    <p className='playerName'>{idPlayerTwo}</p>
                    <img className='leftPlayerImg' src={avatarPlayerTwo} />
                </div>
            }
            {avatarPlayerTwo == "" &&
                <div className='rightPlayerContainer'>
                    <p className='playerName'>Waiting player ...</p>
                    <img className="rightPlayerImg" src="https://imgs.search.brave.com/MWlI8P3aJROiUDO9A-LqFyca9kSRIxOtCg_Vf1xd9BA/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc" alt="User Avatar"></img>
                </div>
            }
        </div>
    )
}