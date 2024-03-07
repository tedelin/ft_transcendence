import ball from '../../game_img/logo.png';

export function RightBar() {
    return (
        <div className='RightBar'>
            <div className="ballContainer">
                <img src={ball} alt="ball" />
                <p>Ball</p>
            </div>
            <div className="paddleContainer">
                <p>Paddle</p>
            </div>
        </div>
    )
}