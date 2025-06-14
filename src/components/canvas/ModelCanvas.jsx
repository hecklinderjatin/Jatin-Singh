import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ModelPhysicsWrapper from '../physics/ModelPhysicsWrapper';
import { handleModelClick } from '../../logic/modelActions';
import ModelPopup from '../../ui/ModelPopup';
import YouTubeMusicPlayer from '../../ui/Records/YouTubeMusicPlayer';
import MiniPlayer from '../../ui/Records/MiniPlayer';
import BenTenGame from '../../ui/Ben10Game/bentengame'; // Adjust path as needed


import {
  AstronautModel,
  EarthModel,
  CricketModel,
  BentenModel,
  SpiderModel,
  RecordModel
} from '../models';

const ModelCanvas = () => {
  const [message, setMessage] = useState('');
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBenTenGame, setShowBenTenGame] = useState(false);


  const onClick = (modelName) => {
    handleModelClick(modelName, setMessage, setShowMusicPlayer, setShowBenTenGame);

    if (modelName === 'Record') {
      setShowMusicPlayer(true);
      setShowMiniPlayer(false);
    }

    if (modelName === 'BenTen') {
      setShowBenTenGame(true);
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const handleMusicPlayerClose = () => {
    setShowMusicPlayer(false);
    setShowMiniPlayer(true);
  };

  const handleMiniPlayerClose = () => {
    setShowMiniPlayer(false);
    setIsPlaying(false);
    setCurrentSong(null);
  };

  const handleBenTenGameClose = () => {
    setShowBenTenGame(false);
  };

  const handleOpenFullPlayer = () => {
    setShowMusicPlayer(true);
    setShowMiniPlayer(false);
  };

  return (
    <>
      {message && <ModelPopup message={message} />}
      
      {showMusicPlayer && (
        <YouTubeMusicPlayer 
          onClose={handleMusicPlayerClose}
          onSongChange={setCurrentSong}
          onPlayingChange={setIsPlaying}
        />
      )}

      {showMiniPlayer && currentSong && (
        <MiniPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onNext={() => {/* Implement next song logic */}}
          onPrevious={() => {/* Implement previous song logic */}}
          onOpenFullPlayer={handleOpenFullPlayer}
          onClose={handleMiniPlayerClose}
        />
      )}

      {showBenTenGame && (
          <BenTenGame
          onClose={handleBenTenGameClose} />
      )}


      <Canvas
        orthographic
        camera={{ zoom: 100, position: [0, 0, 10] }}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} />

        <AstronautModel scale={1.0} position={[0, -3, 0]} />

        <ModelPhysicsWrapper ModelComponent={EarthModel} scale={0.5} onClick={() => onClick('Earth')} />
        <ModelPhysicsWrapper ModelComponent={CricketModel} scale={0.25} onClick={() => onClick('Cricket')} />
        <ModelPhysicsWrapper ModelComponent={BentenModel} collisionRadius={0.1} scale={2.0} onClick={() => onClick('BenTen')} />
        <ModelPhysicsWrapper ModelComponent={SpiderModel} scale={0.4} onClick={() => onClick('Spider')} />
        <ModelPhysicsWrapper ModelComponent={RecordModel} scale={0.15} onClick={() => onClick('Record')} collisionRadius={0.3} />

        <OrbitControls enabled={false} />
      </Canvas>
    </>
  );
};

export default ModelCanvas;
