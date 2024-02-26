import React from 'react';
import './game.css';

export function SettingsMenu({ ballSpeed, setBallSpeed, ballSize, setBallSize, increasedBallSpeed, setIncreasedBallSpeed, paddleHeight, setPaddleHeight, paddleSpeed, setPaddleSpeed, onSaveSettings }) {
    return (
        <div className='settingsMenu'>
            <p style={{ margin: '20px', textAlign: 'center', textDecoration: 'underline', fontSize: '25px' }}>Settings</p>
            <div className="settingRow">
                <div className='label'>
                    <label htmlFor="ballSpeed">Ball Speed :</label>
                </div>
                <input
                    className='settingsSlider'
                    type="range"
                    id="ballSpeed"
                    min="1"
                    max="10"
                    step="1"
                    value={ballSpeed}
                    onChange={(e) => {
                        setBallSpeed(() => parseInt(e.target.value));
                        console.log('set ball : ' + ballSpeed)
                    }}
                />
                <div className='number'>
                    <span>{ballSpeed}</span>
                </div>
            </div>

            <div className="settingRow">
                <div className='label'>
                    <label htmlFor="BallSize">Ball Size :</label>
                </div>
                <input
                    className='settingsSlider'
                    type="range"
                    id='ballSize'
                    min='5'
                    max='30'
                    step='1'
                    value={ballSize}
                    onChange={(e) => setBallSize(parseInt(e.target.value))}
                />
                <div className='number'>
                    <span>{ballSize}</span>
                </div>
            </div>

            <div className='settingRow'>
                <div className='label'>
                    <label htmlFor="increasedBallSpeed">Increased Ball Speed/s :</label>
                </div>
                <input
                    className='settingsSlider'
                    type="range"
                    id="increasedBallSpeed"
                    min="0.001"
                    max="0.010"
                    step="0.001"
                    value={increasedBallSpeed}
                    onChange={(e) => setIncreasedBallSpeed(parseFloat(e.target.value))}
                />
                <div className='number'>
                    <span>{increasedBallSpeed}</span>
                </div>
            </div>

            <div className="settingRow">
                <div className='label'>
                    <label htmlFor="paddleHeight">Paddle Height :</label>
                </div>
                <input
                    className='settingsSlider'
                    type="range"
                    id="paddleHeight"
                    min="100"
                    max="300"
                    step="1"
                    value={paddleHeight}
                    onChange={(e) => setPaddleHeight(parseInt(e.target.value))}
                />
                <div className='number'>
                    <span>{paddleHeight}</span>
                </div>
            </div>

            <div className="settingRow">
                <div className='label'>
                    <label htmlFor="paddleSpeed">Paddle Speed :</label>
                </div>
                <input
                    className='settingsSlider'
                    type="range"
                    id="paddleSpeed"
                    min="1"
                    max="10"
                    step="1"
                    value={paddleSpeed}
                    onChange={(e) => setPaddleSpeed(parseInt(e.target.value))}
                />
                <div className='number'>
                    <span>{paddleSpeed}</span>
                </div>
            </div>
            <div className='buttonContainer'>
                <button className='SettingsButton' onClick={onSaveSettings}>Save</button>
            </div>
        </div>
    );
}