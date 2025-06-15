// WelcomeInteraction.js
import React, { useState, useEffect } from 'react';
import './WelcomeInteraction.css'; // Import the CSS file

const WelcomeInteraction = ({ onInteractionComplete }) => {
  // State for the user's name
  const [userName, setUserName] = useState('');
  // State for the current text being displayed during welcome interaction
  const [welcomeText, setWelcomeText] = useState("Welcome, Traveler!");
  // State to track if user is returning
  const [isReturningUser, setIsReturningUser] = useState(false);
  // State to track if we should show input
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    // Check if user has visited before by looking for stored name
    // Using a key in memory storage for this session
    const storedName = getUserName();
    
    if (storedName) {
      // Returning user
      setIsReturningUser(true);
      setUserName(storedName);
      setWelcomeText(`Welcome back, ${storedName}!`);
      
      // Auto-complete interaction after showing welcome back message
      const returnTimer = setTimeout(() => {
        onInteractionComplete(storedName);
      }, 2500);
      
      return () => clearTimeout(returnTimer);
    } else {
      // New user - show the original flow
      const welcomeTimer = setTimeout(() => {
        setWelcomeText("What is your name, Traveler?");
        setShowInput(true);
      }, 2500);
      
      return () => clearTimeout(welcomeTimer);
    }
  }, [onInteractionComplete]);

  // localStorage functions for persistent storage
  const getUserName = () => {
    try {
      return localStorage.getItem('travelerName') || null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  };

  const setStoredUserName = (name) => {
    try {
      localStorage.setItem('travelerName', name);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  // Optional: Clear stored name (useful for testing or logout functionality)
  const clearStoredUserName = () => {
    try {
      localStorage.removeItem('travelerName');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  // Handle name input change
  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  // Handle Enter key press
  const handleNameSubmit = (e) => {
    if (e.key === 'Enter' && userName.trim() !== '') {
      const trimmedName = userName.trim();
      // Store the user's name for future visits
      setStoredUserName(trimmedName);
      // Pass the user's name to the parent component
      onInteractionComplete(trimmedName);
    }
  };

  return (
    <div className="welcome-overlay">
      <p className="welcome-text">
        {welcomeText}
      </p>
      {showInput && !isReturningUser && (
        <>
          <input
            type="text"
            value={userName}
            onChange={handleNameChange}
            onKeyPress={handleNameSubmit}
            placeholder="Enter your name..."
            className="name-input"
            autoFocus
          />
          {userName.trim() !== '' && (
            <p className="continue-text">Press Enter to continue, {userName}!</p>
          )}
        </>
      )}
    </div>
  );
};

export default WelcomeInteraction;