import ousama from '../../game_img/profil.jpeg';
import booba from '../../game_img/booba.jpeg';
import '../../styles/gameSettings.css';
// import projectLogo from '../../game_img/logo.png';

export function TopBar() {
    return (
        <div className='TopBar'>
            <div className='leftPlayerContainer'>
                <img className='leftPlayerImg' src={ousama} alt="la balaine" />
                <p className='playerName'>Tedelin</p>
            </div>
            <div className='centerContainer'>
                <div className="loader">
                    <span className="loader__element"></span>
                    <span className="loader__element"></span>
                    <span className="loader__element"></span>
                </div>
            </div>
            <div className='rightPlayerContainer'>
                <p className='playerName'>Mcatal-d</p>
                <img className='rightPlayerImg' src={booba} alt="boob" />
            </div>
        </div>
    )
}