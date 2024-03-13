import './BallSettings.css';
import { useState } from 'react';

const GradientSet = ({ label, setProgress, progress }) => {
  const [isDragging, setIsDragging] = useState(false);

  const updateProgress = (e) => {
    const progressBar = e.target.closest('.progress-bar');
    const { width, left } = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - left;
    const newProgress = Math.max(0, Math.min(100, (clickPosition / width) * 100));
    setProgress(newProgress);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateProgress(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      updateProgress(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className='GradientSet'>
      <h2>{label}</h2>
      <div className="progress-bar"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}>
        <div className="progress-cover" style={{ width: `${100 - progress}%` }}></div>
      </div>
    </div>
  );
}

export default GradientSet;

