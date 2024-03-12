import { useState } from 'react';
import ballImg from './ball.svg';
import './BallSize.css'; 

const BallSize = ({ choice, setChoice }) => {
  const [selectedSize, setSelectedSize] = useState(choice);
  console.log("selectedSize : ", selectedSize);
  const onClick = (choice) => {
    let sizeValue;
    switch (choice) {
      case 'smallSizeBall':
        sizeValue = 5; 
        break;
      case 'mediumSizeBall':
        sizeValue = 15;
        break;
      case 'largeSizeBall':
        sizeValue = 25;
        break;
      default:
        sizeValue = 15;
    }
    setSelectedSize(choice); 
    setChoice(sizeValue);
  };

  const getClass = (size) => {
    return `${size} ${selectedSize === size ? 'selectedBall' : ''}`;
  };

  return (
    <div className='BallSize'>
      <h2>Ball Size</h2>
      <div className='BallSizeWrapper'>
        <div className={getClass('smallSizeBall')} onClick={() => onClick('smallSizeBall')}>
			<span className="material-symbols-outlined smallSizeBall">sports_volleyball</span>
        </div>
        <div className={getClass('mediumSizeBall')} onClick={() => onClick('mediumSizeBall')}>
			<span className="material-symbols-outlined mediumSizeBall">sports_volleyball</span>
        </div>
        <div className={getClass('largeSizeBall')} onClick={() => onClick('largeSizeBall')}>
        	<span className="material-symbols-outlined largeSizeBall">sports_volleyball</span>                                           
        </div>
      </div>
    </div>
  );
}

export default BallSize;

