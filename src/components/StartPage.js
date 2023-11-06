import React from 'react';
import '../App.css';
import { Link } from "react-router-dom";


const StartPage = () => {
  return (
    <div className="background-container">
      <h1 className="heading">Dino Jump</h1>
      <Link to="/game">
        <button className="play-button">PLAY</button>
      </Link>
    </div>
  );
};

export default StartPage;