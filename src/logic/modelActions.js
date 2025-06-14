// modelActions.js
export const handleModelClick = (modelName, setMessage, setShowMusicPlayer, setShowBenGame) => {
  const actions = {
    Earth: () => setMessage("🌍 Earth model clicked. Opens planetary features."),
    Cricket: () => setMessage("🏏 Cricket model clicked. Launch cricket stats."),

    BenTen: () => {
      setMessage("👽 BenTen model clicked. Starting alien quiz!");
      if (setShowBenGame) setShowBenGame(true);
    },
    
    Spider: () => setMessage("🕷️ Spider model clicked. Web-slinging mode."),
    
    Record: () => {
      setMessage("🎵 Record model clicked. Opening music player.");
      if (setShowMusicPlayer) setShowMusicPlayer(true);
    },
  };

  if (actions[modelName]) {
    actions[modelName]();
  } else {
    setMessage("Unknown model clicked.");
  }
};
