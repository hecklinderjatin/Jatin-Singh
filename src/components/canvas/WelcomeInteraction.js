import React, { useState, useEffect } from 'react';
import './WelcomeInteraction.css';
import { API, graphqlOperation } from 'aws-amplify';
import { getTraveler } from './graphql/queries';
import { createTraveler } from './graphql/mutations';

const WelcomeInteraction = ({ onInteractionComplete }) => {
  const [userName, setUserName] = useState('');
  const [welcomeText, setWelcomeText] = useState('Welcome, Traveler!');
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [uid, setUid] = useState(null);

  // 1. Get or generate UID (from URL or localStorage)
  useEffect(() => {
    let savedUid = new URLSearchParams(window.location.search).get('uid') || localStorage.getItem('uid');
    if (!savedUid) {
      savedUid = crypto.randomUUID();
      localStorage.setItem('uid', savedUid);
    }
    setUid(savedUid);
  }, []);

  // 2. Load name from cloud or local storage
  useEffect(() => {
    if (!uid) return;

    const loadName = async () => {
      try {
        const res = await API.graphql(graphqlOperation(getTraveler, { uid }));
        const name = res.data.getTraveler?.name;
        if (name) {
          setIsReturningUser(true);
          setUserName(name);
          setWelcomeText(`Welcome back, ${name}!`);
          setTimeout(() => {
            onInteractionComplete(name);
          }, 2500);
          return;
        }
      } catch (e) {
        console.warn("Couldn't fetch from cloud, using local fallback.", e);
      }

      // Fallback to local storage
      const localName = localStorage.getItem('travelerName');
      if (localName) {
        setIsReturningUser(true);
        setUserName(localName);
        setWelcomeText(`Welcome back, ${localName}!`);
        setTimeout(() => {
          onInteractionComplete(localName);
        }, 2500);
      } else {
        // First-time user
        setTimeout(() => {
          setWelcomeText("What is your name, Traveler?");
          setShowInput(true);
        }, 2500);
      }
    };

    loadName();
  }, [uid, onInteractionComplete]);

  // Handle name change
  const handleNameChange = (e) => setUserName(e.target.value);

  // Save to cloud and local
  const storeName = async (name) => {
    localStorage.setItem('travelerName', name);
    try {
      await API.graphql(graphqlOperation(createTraveler, { input: { uid, name } }));
    } catch (e) {
      console.error('Failed to store in cloud', e);
    }
  };

  // Handle Enter key
  const handleNameSubmit = async (e) => {
    if (e.key === 'Enter' && userName.trim()) {
      const trimmedName = userName.trim();
      await storeName(trimmedName);
      onInteractionComplete(trimmedName);
    }
  };

  return (
    <div className="welcome-overlay">
      <p className="welcome-text">{welcomeText}</p>
      {showInput && !isReturningUser && (
        <>
          <input
            type="text"
            value={userName}
            onChange={handleNameChange}
            onKeyDown={handleNameSubmit}
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
