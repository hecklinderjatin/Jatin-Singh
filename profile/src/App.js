import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import StarsBackground from './components/canvas/StarsBackground';
import ModelCanvas from './components/canvas/ModelCanvas';
import './App.css'; // Assuming you have some global CSS here

function App() {
  return (
    <Router basename="/Jatin-Singh">
      <div className="App w-full h-screen relative overflow-hidden bg-slate-900">
        {/* StarsBackground will handle its own positioning */}
        <StarsBackground />
        {/* ModelCanvas will also handle its own positioning */}
        <ModelCanvas />
      </div>
    </Router>
  );
}

export default App;
