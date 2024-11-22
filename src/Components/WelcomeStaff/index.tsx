import React from 'react';
import './WelcomeStyles.scss';

const Welcome = () => {
    return (
      <div className="welcome-container">
        <div className="glasses">
          <div className="lens left"></div>
          <div className="lens right"></div>
          <div className="bridge"></div>
          <div className="temple left"></div>
          <div className="temple right"></div>
        </div>
        <h1 className="welcome-text">Welcome</h1>
      </div>
    );
  };
  
  export default Welcome;