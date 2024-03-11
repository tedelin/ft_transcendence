import { useState } from 'react';
import ballImg from './ball.svg';
import './BallSize.css'; 

const BallSize = ({ setChoice }) => {
  const [selectedSize, setSelectedSize] = useState(null);

  const onClick = (choice) => {
    setSelectedSize(choice); 
    setChoice(choice);
  };

  const getClass = (size) => {
    return `${size} ${selectedSize === size ? 'selectedBall' : ''}`;
  };

  return (
    <div className='BallSize'>
	<h2>Ball Size</h2>
	<div className='BallSizeWrapper'>
		<div className={getClass('smallSizeBall')} onClick={() => onClick('smallSizeBall')}>
			<img src={ballImg} alt="smallSizeBall"></img>
		</div>
		<div className={getClass('mediumSizeBall')} onClick={() => onClick('mediumSizeBall')}>
			<img src={ballImg} alt="mediumSizeBall"></img>
		</div>
		<div className={getClass('largeSizeBall')} onClick={() => onClick('largeSizeBall')}>
			<img src={ballImg} alt="largeSizeBall"></img>												
		</div>
	</div>
    </div>
  );
}

export default BallSize;
