import React from 'react';
import '../App.css';

// new
import { useState, useEffect } from 'react';


const StartPage = () => {
  // new
  const [isDelayed, setDelayed] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading');

  useEffect(() => {
    let intervalId;

    if (isDelayed) {
      intervalId = setInterval(() => {
        setLoadingText(prevText => {
          // Toggle between "Loading", "Loading.", "Loading..", "Loading..."
          switch (prevText) {
            case 'Wait':
              return 'Wait.';
            case 'Wait.':
              return 'Wait..';
            case 'Wait..':
              return 'Wait...';
            default:
              return 'Wait';
          }
        });
      }, 500); // Update text every 500 milliseconds
    }

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount or dependency change
  }, [isDelayed]);


  const handlePlayClick = () => {
    setDelayed(true);
    setTimeout(() => {
      // Redirect to the "/game" route after the delay
      window.location.href = "/game";
    }, 5000); // 5000 milliseconds = 5 seconds
  };


  return (
    <div className="background-container">
      <h1 className="heading">Dino Jump</h1>
        <button className="play-button" onClick={handlePlayClick}
        disabled={isDelayed}>{isDelayed ? loadingText : 'PLAY'}
      </button>
    </div>
  );
};

export default StartPage;