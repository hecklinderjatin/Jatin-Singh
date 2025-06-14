import React from 'react';
import StarsBackground from './components/canvas/StarsBackground';
import ModelCanvas from './components/canvas/ModelCanvas';
import './App.css'; // Assuming you have some global CSS here

function App() {
  return (
    <div className="App w-full h-screen relative overflow-hidden bg-slate-900">
      {/* StarsBackground will handle its own positioning */}
      <StarsBackground />
      {/* ModelCanvas will also handle its own positioning */}
      <ModelCanvas />
    </div>
  );
}

export default App;
