import React from "react";
import "../styles/LoadingSpinner.css";

const LoadingSpinner = ({
  size = "medium",
  color = "blue",
  className = "",
  fullScreen = false,
  text = null,
  variant = "dots", // 'dots', 'spin', 'pulse', 'bars'
}) => {
  const sizeClasses = {
    small: "loading-size-small",
    medium: "loading-size-medium",
    large: "loading-size-large",
    xlarge: "loading-size-xlarge",
  };

  const colorClasses = {
    blue: "loading-color-blue",
    white: "loading-color-white",
    gray: "loading-color-gray",
    green: "loading-color-green",
    red: "loading-color-red",
  };

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return (
          <div
            className={`loading-dots ${sizeClasses[size]} ${colorClasses[color]}`}
          >
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        );
      case "pulse":
        return (
          <div
            className={`loading-pulse ${sizeClasses[size]} ${colorClasses[color]}`}
          >
            <div className="loading-pulse-circle"></div>
            <div className="loading-pulse-circle"></div>
          </div>
        );
      case "bars":
        return (
          <div
            className={`loading-bars ${sizeClasses[size]} ${colorClasses[color]}`}
          >
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
          </div>
        );
      case "spin":
      default:
        return (
          <div
            className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`}
          />
        );
    }
  };

  if (fullScreen) {
    return (
      <div className="loading-spinner-fullscreen">
        <div className="loading-spinner-container">
          {renderLoader()}
          {text && <p className="loading-spinner-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-spinner-inline ${className}`}>
      {renderLoader()}
      {text && <span className="loading-spinner-text-inline">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
