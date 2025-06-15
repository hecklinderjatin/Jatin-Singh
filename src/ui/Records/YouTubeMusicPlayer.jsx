// YouTubeMusicPlayer.jsx - Main UI Component with Username Display

import React, { useState, useEffect } from 'react';
// Make sure to import loadPlaylistFromLocalStorage from songs.js
import { defaultPlaylist, playerConfig, loadPlaylistFromLocalStorage } from './songs.js';
// Import usePlayerLogic from playerLogic.js
import { usePlayerLogic } from './playerLogic.js';
import MiniPlayer from './MiniPlayer.jsx';

// Main YouTube Music Player Component
const YouTubeMusicPlayer = ({ onClose, userName }) => {
    // State management
    const [videoId, setVideoId] = useState(playerConfig.defaultVideoId);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showVideoList, setShowVideoList] = useState(true);
    const [showAddSong, setShowAddSong] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [apiError, setApiError] = useState('');
    const [playerMounted, setPlayerMounted] = useState(false);
    const [playlist, setPlaylist] = useState(loadPlaylistFromLocalStorage());

    // Mini Player state management
    const [showMiniPlayer, setShowMiniPlayer] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Custom hooks
    const { searchYouTube, playlistActions, addCustomSong } = usePlayerLogic();

    // Mount animation
    useEffect(() => {
        setPlayerMounted(true);
    }, []);

    // Ensure currently playing video is valid
    useEffect(() => {
        if (!playlist.some(song => song.id === videoId) && playlist.length > 0) {
            setVideoId(playlist[0].id);
        } else if (playlist.length === 0 && videoId !== playerConfig.defaultVideoId) {
            setVideoId(playerConfig.defaultVideoId);
            setIsPlaying(false);
        }
    }, [playlist, videoId]);

    // Event handlers
    const handleVideoSelect = (id) => {
        playlistActions.selectSong(id, setVideoId, setIsPlaying);
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleSearch = () => {
        if (!searchQuery) return;

        searchYouTube(
            searchQuery,
            () => setIsSearching(true),
            () => setIsSearching(false),
            (error) => setApiError(error),
            (results) => {
                setSearchResults(results);
            }
        );
    };

    const handleAddToPlaylist = (song) => {
        // Add username to the song object when adding to playlist
        const songWithUser = {
            ...song,
            addedBy: userName, // Track who added this song
            addedAt: new Date().toISOString() // Optional: track when it was added
        };
        
        playlistActions.addSong(playlist, songWithUser, setPlaylist);
        setSearchResults([]);
        setSearchQuery('');
        setShowAddSong(false);
        setShowVideoList(true);
    };

    const handleRemoveFromPlaylist = (songId) => {
        playlistActions.removeSong(playlist, songId, setPlaylist);
    };

    const handleCustomSong = () => {
        // Pass userName to addCustomSong function
        addCustomSong(playlist, setPlaylist, userName);
    };

    const handleNextSong = () => {
        playlistActions.playNext(playlist, videoId, setVideoId, setIsPlaying);
    };

    const handlePreviousSong = () => {
        playlistActions.playPrevious(playlist, videoId, setVideoId, setIsPlaying);
    };

    // Mini Player handlers
    const handleMinimize = () => {
        setIsMinimized(true);
        setShowMiniPlayer(true);
    };

    const handleExpandFromMini = () => {
        setIsMinimized(false);
        setShowMiniPlayer(false);
    };

    const handleCloseMiniPlayer = () => {
        setShowMiniPlayer(false);
        setIsMinimized(false);
    };

    // Helper function to format artist display with username
    const formatArtistDisplay = (song) => {
        if (song.addedBy && song.addedBy !== 'System') {
            return `${song.artist} • Added by ${song.addedBy}`;
        }
        return song.artist;
    };

    const currentSong = playlist.find(song => song.id === videoId) || {};

    return (
        <>
            {/* CSS Styles */}
            <style jsx>{`
                .player-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: rgba(0, 0, 0, 0.95);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: white;
                    padding: 20px;
                    box-sizing: border-box;
                    opacity: ${playerMounted ? 1 : 0};
                    transform: ${playerMounted ? 'translateY(0)' : 'translateY(20px)'};
                    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
                }

                .player-container.hidden {
                    display: none;
                }

                .top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 15px;
                    flex-shrink: 0;
                }

                .title {
                    margin: 0;
                    font-size: 1.5rem;
                    color: white;
                    font-weight: 600;
                }

                .user-greeting {
                    font-size: 0.9rem;
                    color: #aaa;
                    margin-left: 15px;
                }

                .button-container {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .icon-button {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    font-size: 1.2rem;
                    cursor: pointer;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .icon-button:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.05);
                }

                .minimize-button {
                    background: rgba(255, 193, 7, 0.2);
                    border: 1px solid rgba(255, 193, 7, 0.4);
                    color: #ffc107;
                }

                .minimize-button:hover {
                    background: rgba(255, 193, 7, 0.3);
                }

                .main-content {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 20px;
                    flex: 1;
                    min-height: 0;
                    overflow: hidden;
                }

                @media (max-width: 1024px) {
                    .main-content {
                        grid-template-columns: 1fr;
                        grid-template-rows: auto 1fr;
                    }
                }

                .left-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    min-height: 0;
                }

                .video-container {
                    background-color: #000;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                    transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
                }

                .video-container:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7);
                }

                .video-iframe {
                    width: 100%;
                    aspect-ratio: 16 / 9;
                    border: none;
                    display: block;
                }

                .video-info {
                    padding: 15px;
                }

                .video-title {
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin: 0 0 10px 0;
                    color: white;
                    line-height: 1.3;
                }

                .controls-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .artist-info {
                    margin: 0;
                    color: #aaa;
                    font-size: 0.9rem;
                    max-width: 300px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .added-by-text {
                    color: #3ea6ff;
                    font-weight: 500;
                }

                .playback-controls {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .control-button {
                    background: none;
                    color: white;
                    border: 1px solid #555;
                    border-radius: 50%;
                    width: 45px;
                    height: 45px;
                    cursor: pointer;
                    font-size: 1.4rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .control-button:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #777;
                    transform: scale(1.05);
                }

                .play-pause-button {
                    background: white;
                    color: black;
                    border: none;
                    border-radius: 50%;
                    width: 60px;
                    height: 60px;
                    cursor: pointer;
                    font-size: 2rem;
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .play-pause-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 0 25px rgba(255, 255, 255, 0.7);
                }

                .right-panel {
                    display: flex;
                    flex-direction: column;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 15px;
                    min-height: 0;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(10px);
                }

                .tabs-container {
                    display: flex;
                    gap: 5px;
                    margin-bottom: 15px;
                    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
                }

                .tab-button {
                    padding: 10px 15px;
                    cursor: pointer;
                    background: none;
                    border: none;
                    color: #aaa;
                    font-size: 1rem;
                    border-bottom: 2px solid transparent;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }

                .tab-button.active {
                    color: white;
                    border-color: white;
                    font-weight: bold;
                }

                .tab-button:hover {
                    color: #ddd;
                }

                .content-panel {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    scrollbar-width: thin;
                    scrollbar-color: #555 rgba(255, 255, 255, 0.05);
                }

                .content-panel::-webkit-scrollbar {
                    width: 8px;
                }

                .content-panel::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }

                .content-panel::-webkit-scrollbar-thumb {
                    background: #555;
                    border-radius: 10px;
                }

                .content-panel::-webkit-scrollbar-thumb:hover {
                    background: #777;
                }

                .empty-playlist {
                    color: #aaa;
                    text-align: center;
                    margin-top: 20px;
                    font-style: italic;
                }

                .playlist-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    cursor: pointer;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    border: 1px solid transparent;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .playlist-item:hover {
                    background: rgba(255, 255, 255, 0.08);
                    transform: translateX(4px);
                }

                .playlist-item.selected {
                    background: rgba(62, 166, 255, 0.2);
                    border-color: rgba(62, 166, 255, 0.5);
                    box-shadow: 0 0 8px rgba(62, 166, 255, 0.3);
                }

                .playlist-item-text {
                    flex: 1;
                    overflow: hidden;
                    min-width: 0;
                }

                .playlist-item-title {
                    font-weight: bold;
                    font-size: 0.9rem;
                    color: white;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 4px;
                }

                .playlist-item-details {
                    font-size: 0.8rem;
                    color: #aaa;
                    opacity: 0.9;
                    line-height: 1.3;
                }

                .user-badge {
                    color: #3ea6ff;
                    font-weight: 500;
                    font-size: 0.75rem;
                }

                .remove-button {
                    background: rgba(220, 53, 69, 0.3);
                    color: #ff8a8a;
                    border: none;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    margin-left: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.7;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }

                .remove-button:hover {
                    opacity: 1;
                    background: rgba(220, 53, 69, 0.5);
                    transform: scale(1.1);
                }

                .search-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .search-input-group {
                    display: flex;
                    gap: 10px;
                }

                .search-input {
                    flex: 1;
                    padding: 12px 15px;
                    border-radius: 20px;
                    border: 1px solid #555;
                    background: rgba(0, 0, 0, 0.5);
                    color: white;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #3ea6ff;
                    box-shadow: 0 0 0 2px rgba(62, 166, 255, 0.2);
                }

                .search-button {
                    background: #3ea6ff;
                    color: white;
                    border: none;
                    border-radius: 20px;
                    padding: 12px 20px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 60px;
                }

                .search-button:hover:not(:disabled) {
                    background: #2196f3;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(62, 166, 255, 0.3);
                }

                .search-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .custom-song-button {
                    background: rgba(255, 255, 255, 0.1);
                    color: #eee;
                    border: 1px solid #555;
                    border-radius: 20px;
                    padding: 10px 15px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    text-align: center;
                    transition: all 0.3s ease;
                }

                .custom-song-button:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateY(-1px);
                }

                .search-results {
                    margin-top: 15px;
                }

                .search-result-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    transition: all 0.3s ease;
                    border: 1px solid transparent;
                }

                .search-result-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .search-result-title {
                    flex: 1;
                    font-size: 0.9rem;
                    color: white;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    min-width: 0;
                }

                .add-result-button {
                    background: #28a745;
                    color: white;
                    border: none;
                    border-radius: 15px;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }

                .add-result-button:hover {
                    background: #218838;
                    transform: translateY(-1px);
                }

                .api-error {
                    background: rgba(220, 53, 69, 0.2);
                    border: 1px solid rgba(220, 53, 69, 0.4);
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 15px;
                    color: #f8d7da;
                    font-size: 0.9rem;
                }

                .setup-info {
                    background: rgba(23, 162, 184, 0.1);
                    border: 1px solid rgba(23, 162, 184, 0.3);
                    border-radius: 8px;
                    padding: 12px;
                    color: #17a2b8;
                    font-size: 0.8rem;
                    line-height: 1.4;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .loading-spin {
                    animation: spin 1s linear infinite;
                    display: inline-block;
                }
            `}</style>

            {/* Main Player - Hidden when minimized */}
            <div className={`player-container ${isMinimized ? 'hidden' : ''}`}>
                <div className="top-bar">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2 className="title">{playerConfig.title}</h2>
                        {userName && (
                            <span className="user-greeting">Welcome, {userName}!</span>
                        )}
                    </div>
                    <div className="button-container">
                        <button
                            onClick={handleMinimize}
                            className="icon-button minimize-button"
                            title="Minimize Player"
                        >
                            ➖
                        </button>
                        <button 
                            onClick={onClose} 
                            className="icon-button" 
                            title="Close Player"
                        >
                            ✖
                        </button>
                    </div>
                </div>

                <div className="main-content">
                    {/* Left Panel: Video Player and Controls */}
                    <div className="left-panel">
                        <div className="video-container">
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&mute=0&rel=0&showinfo=0`}
                                title="YouTube video player"
                                className="video-iframe"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        
                        <div className="video-info">
                            <h3 className="video-title">{currentSong.title || 'No song selected'}</h3>
                            <div className="controls-container">
                                <p className="artist-info">
                                    {currentSong.addedBy && currentSong.addedBy !== 'System' ? (
                                        <>
                                            {currentSong.artist} • <span className="added-by-text">Added by {currentSong.addedBy}</span>
                                        </>
                                    ) : (
                                        currentSong.artist || 'Unknown Artist'
                                    )}
                                </p>
                                <div className="playback-controls">
                                    <button 
                                        onClick={handlePreviousSong} 
                                        className="control-button" 
                                        title="Previous"
                                    >
                                        ⏮
                                    </button>
                                    <button 
                                        onClick={togglePlay} 
                                        className="play-pause-button" 
                                        title={isPlaying ? 'Pause' : 'Play'}
                                    >
                                        {isPlaying ? '⏸' : '▶'}
                                    </button>
                                    <button 
                                        onClick={handleNextSong} 
                                        className="control-button" 
                                        title="Next"
                                    >
                                        ⏭
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Info/Tips Box */}
                        <div className="setup-info">
                            <strong>🔧 Setup:</strong> Add your YouTube API key in `playerLogic.js` or a `.env` file to enable search. Current functionality is limited to the default playlist.
                        </div>
                    </div>

                    {/* Right Panel: Playlist and Add Song */}
                    <div className="right-panel">
                        <div className="tabs-container">
                            <button
                                onClick={() => { setShowVideoList(true); setShowAddSong(false); }}
                                className={`tab-button ${showVideoList ? 'active' : ''}`}
                            >
                                Playlist ({playlist.length})
                            </button>
                            <button
                                onClick={() => { setShowAddSong(true); setShowVideoList(false); }}
                                className={`tab-button ${showAddSong ? 'active' : ''}`}
                            >
                                ➕ Add Song
                            </button>
                        </div>

                        <div className="content-panel">
                            {/* Playlist View */}
                            {showVideoList && (
                                <div>
                                    {playlist.length === 0 ? (
                                        <p className="empty-playlist">
                                            Your playlist is empty! Add some songs from the "➕ Add Song" tab.
                                        </p>
                                    ) : (
                                        playlist.map((video) => (
                                            <div
                                                key={video.id}
                                                className={`playlist-item ${videoId === video.id ? 'selected' : ''}`}
                                                onClick={() => handleVideoSelect(video.id)}
                                            >
                                                <div className="playlist-item-text">
                                                    <div className="playlist-item-title">{video.title}</div>
                                                    <div className="playlist-item-details">
                                                        {video.artist}
                                                        {video.duration && ` • ${video.duration}`}
                                                        {video.addedBy && video.addedBy !== 'System' && (
                                                            <>
                                                                <br />
                                                                <span className="user-badge">Added by {video.addedBy}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {playlist.length > 1 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFromPlaylist(video.id);
                                                        }}
                                                        className="remove-button"
                                                        title="Remove from playlist"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Add Song View */}
                            {showAddSong && (
                                <div>
                                    {apiError && (
                                        <div className="api-error">⚠️ {apiError}</div>
                                    )}

                                    <div className="search-container">
                                        <div className="search-input-group">
                                            <input
                                                type="text"
                                                placeholder="Search for songs..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                className="search-input"
                                            />
                                            <button
                                                onClick={handleSearch}
                                                disabled={isSearching || !searchQuery}
                                                className="search-button"
                                            >
                                                {isSearching ? (
                                                    <span className="loading-spin">⚙️</span>
                                                ) : (
                                                    '🔍'
                                                )}
                                            </button>
                                        </div>
                                        <button 
                                            onClick={handleCustomSong} 
                                            className="custom-song-button"
                                        >
                                            🔗 Add by YouTube URL or ID
                                        </button>
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div className="search-results">
                                            {searchResults.map((result) => (
                                                <div key={result.id} className="search-result-item">
                                                    <div className="search-result-title">
                                                        {result.title}
                                                    </div>
                                                    <button 
                                                        onClick={() => handleAddToPlaylist(result)}
                                                        className="add-result-button"
                                                    >
                                                        ➕ Add
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini Player - Shows when minimized */}
            {showMiniPlayer && (
                <MiniPlayer
                    videoId={videoId}
                    isPlaying={isPlaying}
                    onTogglePlay={togglePlay}
                    onNext={handleNextSong}
                    onPrevious={handlePreviousSong}
                    currentSong={currentSong}
                    onExpand={handleExpandFromMini}
                    onClose={handleCloseMiniPlayer}
                />
            )}
        </>
    );
};

export default YouTubeMusicPlayer;