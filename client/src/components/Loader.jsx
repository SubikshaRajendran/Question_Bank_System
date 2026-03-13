import React from 'react';
import './Loader.css';

const Loader = ({ message = 'Loading...', fullScreen = false }) => {
    return (
        <div className={`loader-container ${fullScreen ? 'loader-fullscreen' : ''}`}>
            <div className="loader-spinner"></div>
            {message && <p className="loader-text">{message}</p>}
        </div>
    );
};

export default Loader;
