import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'blue', 
  className = '',
  fullScreen = false,
  text = null 
}) => {
  const sizeClasses = {
    small: 'loading-spinner-small',
    medium: 'loading-spinner-medium', 
    large: 'loading-spinner-large',
    xlarge: 'loading-spinner-xlarge'
  };

  const colorClasses = {
    blue: 'loading-spinner-blue',
    white: 'loading-spinner-white',
    gray: 'loading-spinner-gray',
    green: 'loading-spinner-green',
    red: 'loading-spinner-red'
  };

  if (fullScreen) {
    return (
      <div className="loading-spinner-fullscreen">
        <div className="loading-spinner-container">
          <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]} ${className}`} />
          {text && <p className="loading-spinner-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-spinner-inline ${className}`}>
      <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`} />
      {text && <span className="loading-spinner-text-inline">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
