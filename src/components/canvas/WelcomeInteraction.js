// WelcomeInteraction.js
import React, { useState, useEffect } from 'react';
import './WelcomeInteraction.css'; // Import the CSS file

const WelcomeInteraction = ({ onInteractionComplete }) => {
  // State for the user's name
  const [userName, setUserName] = useState('');
  // State for the current text being displayed during welcome interaction
  const [welcomeText, setWelcomeText] = useState("Welcome, Traveler!");

  useEffect(() => {
    // First, show "Welcome, Traveler!"
    const welcomeTimer = setTimeout(() => {
      // After a delay, change text and ask for name
      setWelcomeText("What is your name, Traveler?");
    }, 2500); // Display "Welcome, Traveler!" for 2.5 seconds

    return () => clearTimeout(welcomeTimer);
  }, []); // Run only once when component mounts

  // Handle name input change
  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  // Handle Enter key press
  const handleNameSubmit = (e) => {
    if (e.key === 'Enter' && userName.trim() !== '') {
      // Pass the user's name to the parent component
      onInteractionComplete(userName.trim());
    }
  };

  return (
    <div className="welcome-overlay">
      <p className="welcome-text">
        {welcomeText}
      </p>
      {welcomeText === "What is your name, Traveler?" && (
        <input
          type="text"
          value={userName}
          onChange={handleNameChange}
          onKeyPress={handleNameSubmit}
          placeholder="Enter your name..."
          className="name-input"
        />
      )}
      {userName.trim() !== '' && welcomeText === "What is your name, Traveler?" && (
          <p className="continue-text">Press Enter to continue, {userName}!</p>
      )}
    </div>
  );
};

export default WelcomeInteraction;