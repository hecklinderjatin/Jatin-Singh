import React, { useState, useEffect, useCallback } from 'react';

// --- ALIEN ROSTER ---
// Ensure images are in your `public/images` folder.
const aliens = [
  { name: 'Four Arms', image: '/images/four-arms.png' },
  { name: 'Heatblast', image: '/images/heatblast.png' },
  { name: 'XLR8', image: '/images/xlr8.png' },
  { name: 'Diamondhead', image: '/images/diamondhead.png' },
  { name: 'Upgrade', image: '/images/upgrade.png' },
  { name: 'Ghostfreak', image: '/images/ghostfreak.png' },
  { name: 'Wildmutt', image: '/images/wildmutt.png' },
  { name: 'Stinkfly', image: '/images/stinkfly.png' },
  { name: 'Ripjaws', image: '/images/ripjaws.png' },
  { name: 'Grey Matter', image: '/images/grey-matter.png' },
  { name: 'Cannonbolt', image: '/images/cannonbolt.png' },
  { name: 'Wildvine', image: '/images/wildvine.png' },
];

// --- SHUFFLED OPTIONS GENERATOR ---
const getRandomOptions = (correctAlien) => {
  const options = new Set([correctAlien.name]);
  while (options.size < 4) {
    const randomAlien = aliens[Math.floor(Math.random() * aliens.length)];
    options.add(randomAlien.name);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

// --- UI COMPONENTS ---

// Radial Timer Component
const RadialTimer = ({ timeLeft }) => {
  const percentage = (timeLeft / 10) * 100;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const isLowTime = timeLeft <= 3;

  return (
    <svg style={styles.timerSvg}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="100"
        cy="100"
        r={radius}
        style={styles.timerCircleBase}
      />
      <circle
        cx="100"
        cy="100"
        r={radius}
        style={{
          ...styles.timerCircleProgress,
          strokeDashoffset: offset,
          stroke: isLowTime ? '#ff4757' : '#00ff7f',
          animation: isLowTime ? 'pulse 1s infinite' : 'none',
        }}
      />
      {/* Text to display remaining seconds */}
      <text
        x="100"
        y="100"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: '3rem', // Larger font size for the time
          fontWeight: 'bold',
          fill: isLowTime ? '#ff4757' : '#00ff7f', // Color changes with low time
          transition: 'fill 0.3s',
          filter: 'url(#glow)', // Apply glow effect to text as well
        }}
      >
        {timeLeft}
      </text>
    </svg>
  );
};

const FeedbackIcon = ({ status }) => {
  const iconStyles = { width: '28px', height: '28px', marginRight: '10px' };
  if (status === 'correct') {
    return (
      <svg style={iconStyles} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (status === 'incorrect' || status === 'timeout') {
    return (
      <svg style={iconStyles} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return null;
};

// --- MAIN GAME COMPONENT ---
const BenTenGame = ({ onClose }) => { // Added onClose prop
  const [currentAlien, setCurrentAlien] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [feedback, setFeedback] = useState({ message: '', status: '' });
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);

  const generateNewRound = useCallback(() => {
    const randomAlien = aliens[Math.floor(Math.random() * aliens.length)];
    setCurrentAlien(randomAlien);
    setOptions(getRandomOptions(randomAlien));
    setSelectedOption('');
    setFeedback({ message: '', status: '' });
    setTimeLeft(10);
  }, []);

  useEffect(() => {
    generateNewRound();
  }, [generateNewRound]);

  useEffect(() => {
    if (selectedOption) return;
    if (timeLeft === 0) {
      setSelectedOption('timeout');
      setFeedback({ message: `Time's up! It was ${currentAlien?.name}.`, status: 'timeout' });
      setTimeout(generateNewRound, 2500);
      return;
    }
    const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, selectedOption, currentAlien, generateNewRound]);

  const handleGuess = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === currentAlien.name) {
      setFeedback({ message: 'Correct!', status: 'correct' });
      setScore(s => s + 1);
    } else {
      setFeedback({ message: `Wrong! It was ${currentAlien.name}.`, status: 'incorrect' });
    }
    setTimeout(generateNewRound, 2500);
  };

  if (!currentAlien) {
    return <div style={styles.loading}>LOADING OMNITRIX...</div>;
  }

  return (
    <div style={styles.gameBox}>
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); box-shadow: 0 0 10px #ff4757; }
              50% { transform: scale(1.05); box-shadow: 0 0 25px #ff4757; }
              100% { transform: scale(1); box-shadow: 0 0 10px #ff4757; }
            }
              @keyframes feedback-in {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
              @keyframes popup-appear {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
          `}
        </style>
        {/* Close button moved inside gameBox */}
        <button
          onClick={onClose}
          style={styles.closeButton}
          onMouseOver={e => { e.currentTarget.style.backgroundColor = styles.closeButtonHover.backgroundColor; e.currentTarget.style.transform = styles.closeButtonHover.transform; }}
          onMouseOut={e => { e.currentTarget.style.backgroundColor = styles.closeButton.backgroundColor; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '24px', height: '24px', color: '#fff'}}>
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div style={styles.header}>
            <h1 style={styles.title}>GUESS THE ALIEN</h1>
            <div style={styles.scoreBox}>
              <div style={styles.score}>SCORE: {score}</div>
              <div style={styles.timerSecs}>TIME: {timeLeft}s</div>
            </div>
        </div>
        
        <div style={styles.omnitrixDial}>
          <RadialTimer timeLeft={timeLeft} />
          <div style={styles.imageBox}>
            <img
              src={currentAlien.image}
              alt="Guess the Alien"
              // Changed filter to make image white (silhouette) initially
              style={{...styles.image, filter: selectedOption ? 'brightness(100%)' : 'brightness(0%) invert(100%)'}}
              onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x300/000/FFF?text=ALIEN'; }}
            />
          </div>
        </div>
        
        {feedback.message ? (
          <div style={{
            ...styles.feedback, 
            color: feedback.status === 'correct' ? '#00ff7f' : '#ff4757',
            animation: 'feedback-in 0.5s ease-out forwards',
          }}>
            <FeedbackIcon status={feedback.status} />
            <span>{feedback.message}</span>
          </div>
        ) : (
          <div style={styles.options}>
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleGuess(option)}
                disabled={!!selectedOption}
                style={{
                  ...styles.button,
                  ...(selectedOption && {
                    cursor: 'not-allowed',
                    opacity: option === currentAlien.name ? 1 : 0.3,
                    backgroundColor:
                      option === currentAlien.name ? '#00ff7f' 
                      : selectedOption === option ? '#ff4757' 
                      : 'rgba(255, 255, 255, 0.05)',
                    color: option === currentAlien.name ? '#000' : '#FFF',
                    border: option === currentAlien.name ? '2px solid #00ff7f' 
                      : selectedOption === option ? '2px solid #ff4757'
                      : '2px solid rgba(255, 255, 255, 0.1)',
                  }),
                }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = styles.buttonHover.boxShadow; e.currentTarget.style.borderColor = styles.buttonHover.borderColor;}}
                onMouseOut={e => { e.currentTarget.style.boxShadow = styles.button.boxShadow; e.currentTarget.style.borderColor = styles.button.borderColor; }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
  );
};

// --- OMNITRIX-THEMED STYLES ---
const styles = {
  container: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
    background: 'radial-gradient(ellipse at center, #1b2735 0%, #090a0f 100%)',
    color: '#fff', fontFamily: "'Poppins', sans-serif", padding: '20px', boxSizing: 'border-box',
  },
  loading: { fontSize: '2rem', fontFamily: "'Poppins', sans-serif", color: '#00ff7f', textShadow: '0 0 10px #00ff7f' },
  gameBox: {
    background: 'rgba(10, 10, 10, 0.9)', // Slightly more opaque for pop-up effect
    backdropFilter: 'blur(15px)', // Increased blur
    WebkitBackdropFilter: 'blur(15px)',
    borderRadius: '24px', padding: '30px 40px', width: '100%', maxWidth: '480px',
    border: '1px solid rgba(0, 255, 127, 0.2)', boxShadow: '0 0 40px rgba(0, 255, 127, 0.4)', // Stronger shadow
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    position: 'relative', // IMPORTANT: for positioning close button inside
  },
  header: { textAlign: 'center', marginBottom: '20px', width: '100%' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.15em', margin: '0 0 10px 0' },
  scoreBox: { // New style for the combined score and timer secs
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(0, 255, 127, 0.1)',
    padding: '10px 20px', // Increased padding
    borderRadius: '12px',
    border: '1px solid rgba(0, 255, 127, 0.3)',
    boxShadow: '0 0 20px rgba(0, 255, 127, 0.3)', // Stronger shadow for the box
    marginBottom: '10px',
  },
  score: { fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: '#FFFFFF' }, // Larger font, bolder
  timerSecs: { fontSize: '1rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }, // Larger font, bolder
  omnitrixDial: { position: 'relative', width: '250px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' },
  timerSvg: { position: 'absolute', top: '50%', left: '50%', width: '200px', height: '200px', transform: 'translate(-50%, -50%) rotate(-90deg)', filter: 'url(#glow)' },
  timerCircleBase: { fill: 'none', stroke: 'rgba(0, 255, 127, 0.15)', strokeWidth: '10' },
  timerCircleProgress: { fill: 'none', strokeWidth: '10', strokeLinecap: 'round', transition: 'stroke-dashoffset 1s linear, stroke 0.3s' },
  imageBox: {
    width: '180px', height: '180px',
    backgroundColor: '#000', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '4px solid #333',
    // New: Add a glow to the image box itself for better visual alignment
    boxShadow: '0 0 25px rgba(0, 255, 127, 0.7), inset 0 0 10px rgba(0, 255, 127, 0.4)',
    transition: 'box-shadow 0.3s ease-in-out', // Smooth transition for glow
  },
  image: { width: '100%', height: '100%', objectFit: 'contain', transition: 'filter 0.4s ease-in-out' },
  options: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px',
    width: '100%', minHeight: '140px' /* Placeholder for feedback */,
  },
  button: {
    padding: '16px 10px', fontSize: '1rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif",
    border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', cursor: 'pointer',
    transition: 'all 0.2s ease', boxShadow: 'none'
  },
  buttonHover: {
    boxShadow: '0 0 15px rgba(0, 255, 127, 0.6)', // Green glow on hover
    borderColor: 'rgba(255, 255, 255, 0.1)' // Keep original border color
  },
  feedback: {
    fontSize: '1.2rem', fontWeight: '600', padding: '12px 20px', borderRadius: '12px',
    width: '100%', minHeight: '140px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  closeButton: { // Style for close button moved to gameBox styles
      position: 'absolute',
      top: '15px',
      right: '15px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, transform 0.2s ease',
      zIndex: 1001, // Ensure it's above other content
    },
    closeButtonHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      transform: 'scale(1.1)',
    },
};


// App component to act as the pop-up container
const App = () => {
  // State to control the visibility of the pop-up
  const [isOpen, setIsOpen] = useState(true);

  // Function to handle closing the pop-up
  const handleClose = () => {
    setIsOpen(false);
    console.log("Pop-up closed!"); // In a real app, you might unmount the component or navigate away
  };

  if (!isOpen) {
    return null; // Don't render anything if the pop-up is closed
  }

  return (
    <div style={popupStyles.overlay}>
      <div style={popupStyles.popup}>
        {/* Pass handleClose as a prop to BenTenGame */}
        <BenTenGame onClose={handleClose} />
      </div>
    </div>
  );
};

const popupStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker, semi-transparent backdrop
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px', // Ensure padding for smaller screens
      boxSizing: 'border-box',
    },
    popup: {
      background: 'transparent', // Game component handles its own background
      borderRadius: '24px',
      boxShadow: 'none', // Removed this glow as per user request
      maxWidth: '520px', // Slightly larger max width for the pop-up container
      width: '100%',
      position: 'relative', // Allows for positioning close button if added
      animation: 'popup-appear 0.5s ease-out forwards',
    },
    // Removed closeButton and closeButtonHover from here
};

export default App; // Export App as the main component
