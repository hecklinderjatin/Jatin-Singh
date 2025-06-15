// App.js
import React, { useState } from 'react';
import StarsCanvas from './components/canvas/StarsCanvas'; // Import the new combined component
import ModelCanvas from './components/canvas/ModelCanvas';
import WelcomeInteraction from './components/canvas/WelcomeInteraction'; // Import the WelcomeInteraction component
import './App.css'; // Assuming you have some global CSS here

function App() {
  // State to track if the boot animation phase has finished within StarsCanvas
  const [bootAnimationFinished, setBootAnimationFinished] = useState(false);
  // State to track if the welcome interaction has been completed
  const [welcomeInteractionComplete, setWelcomeInteractionComplete] = useState(false);
  // State to store the user's name
  const [userName, setUserName] = useState('');

  // Callback function for StarsCanvas to notify App when its boot phase is complete
  const handleStarsBootAnimationComplete = () => {
    setBootAnimationFinished(true);
  };

  // Callback function for WelcomeInteraction to notify App when user interaction is complete
  const handleWelcomeInteractionComplete = (name) => {
    setUserName(name); // Store the user's name
    setWelcomeInteractionComplete(true);
  };

  return (
    <div className="App w-full h-screen relative overflow-hidden bg-slate-900">
      {/* StarsCanvas handles both the boot animation and the continuous background */}
      <StarsCanvas onBootAnimationComplete={handleStarsBootAnimationComplete} />

      {/* Loading text overlay, shown only during the boot animation */}
      {!bootAnimationFinished && (
        <div className="absolute inset-0 flex items-center justify-center z-20 text-white text-4xl font-bold opacity-0 animate-fadeInPulse">
          Traveling Through Galaxy...
        </div>
      )}

      {/* Welcome interaction overlay, shown after boot animation finishes but before main content */}
      {bootAnimationFinished && !welcomeInteractionComplete && (
        <WelcomeInteraction onInteractionComplete={handleWelcomeInteractionComplete} />
      )}

      {/* ModelCanvas with fade-in animation after both boot animation and welcome interaction finish */}
      {bootAnimationFinished && welcomeInteractionComplete && (
        <div className="animate-fadeIn">
          <ModelCanvas userName={userName} />
        </div>
      )}

      {/* Optional: Display welcome message for the user */}
      {bootAnimationFinished && welcomeInteractionComplete && userName && (
        <div className="absolute top-4 right-4 z-30 text-white text-lg font-semibold bg-black bg-opacity-30 px-4 py-2 rounded-lg animate-fadeIn">
          Welcome, {userName}!
        </div>
      )}

      {/* Define animations */}
      <style>
        {`
        @keyframes fadeInPulse {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; } /* Fade out completely for a smooth transition */
        }
        
        @keyframes fadeIn {
          0% { 
            opacity: 0; 
            transform: translateY(20px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
          }
        }


        
        .animate-fadeInPulse {
          animation: fadeInPulse 3s forwards; /* Match duration of boot animation */
        }
        
        .animate-fadeIn {
          animation: fadeIn 3s ease-out forwards;
          opacity: 0; /* Start invisible */
        }


        `}
      </style>
    </div>
  );
}

export default App;