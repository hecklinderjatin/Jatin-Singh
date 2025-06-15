// YouTubeMusicPlayer.jsx - Main UI Component

import React, { useState, useEffect } from 'react';
// Make sure to import loadPlaylistFromLocalStorage from songs.js
import { defaultPlaylist, playerConfig, loadPlaylistFromLocalStorage } from './songs.js';
// Import loadUserNameFromLocalStorage from playerLogic.js
import { usePlayerLogic } from './playerLogic.js';
import MiniPlayer from './MiniPlayer.jsx';


// Main YouTube Music Player Component
const YouTubeMusicPlayer = ({ onClose }) => {
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
    const [playlist, setPlaylist] = useState(loadPlaylistFromLocalStorage()); // Existing persistence
    
    // NEW STATE: For the user's name
    const [userName, setUserName] = useState('');

    // NEW: Mini Player state management
    const [showMiniPlayer, setShowMiniPlayer] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Custom hooks
    // Destructure loadUserNameFromLocalStorage from usePlayerLogic
    const { searchYouTube, playlistActions, addCustomSong, loadUserNameFromLocalStorage } = usePlayerLogic();

    // Mount animation
    useEffect(() => {
        setPlayerMounted(true);
        // NEW: Load user name when component mounts
        setUserName(loadUserNameFromLocalStorage());
    }, []);

    // Ensure currently playing video is valid (existing logic)
    useEffect(() => {
        if (!playlist.some(song => song.id === videoId) && playlist.length > 0) {
            setVideoId(playlist[0].id);
        } else if (playlist.length === 0 && videoId !== playerConfig.defaultVideoId) {
            setVideoId(playerConfig.defaultVideoId);
            setIsPlaying(false);
        }
    }, [playlist, videoId]);


    // Event handlers (no direct changes needed here as they call playlistActions which handles persistence)
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
            () => setApiError(''), // Clear error on new search attempt
            (error) => setApiError(error),
            (results) => {
                setSearchResults(results);
                setIsSearching(false); // Ensure search state is reset on success or fail
            }
        );
    };

    const handleAddToPlaylist = (song) => {
        playlistActions.addSong(playlist, song, setPlaylist);
        setSearchResults([]);
        setSearchQuery('');
        setShowAddSong(false);
        setShowVideoList(true); // Switch to playlist view after adding
    };

    const handleRemoveFromPlaylist = (songId) => {
        playlistActions.removeSong(playlist, songId, setPlaylist);
    };

    const handleCustomSong = () => {
        // NEW: Pass setUserName to addCustomSong
        addCustomSong(playlist, setPlaylist, setUserName);
    };

    const handleNextSong = () => {
        playlistActions.playNext(playlist, videoId, setVideoId, setIsPlaying);
    };

    const handlePreviousSong = () => {
        playlistActions.playPrevious(playlist, videoId, setVideoId, setIsPlaying);
    };

    // NEW: Mini Player handlers
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

    const styles = {
        playerContainer: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.95)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            opacity: playerMounted ? 1 : 0,
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
            fontFamily: 'Arial, sans-serif',
            color: '#fff',
            padding: '20px',
            boxSizing: 'border-box',
            transform: playerMounted ? 'translateY(0)' : 'translateY(20px)',
        },
        topBar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '15px',
        },
        title: {
            margin: 0,
            fontSize: '1.5rem',
            color: '#fff',
        },
        // NEW: style for user name display
        userNameDisplay: {
            fontSize: '1rem',
            color: '#ffc107',
            marginRight: '20px',
            fontWeight: 'bold',
        },
        buttonContainer: {
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
        },
        closeButton: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                transform: 'scale(1.05)',
            },
        },
        minimizeButton: {
            background: 'rgba(255, 193, 7, 0.2)',
            border: '1px solid rgba(255, 193, 7, 0.4)',
            color: '#ffc107',
            fontSize: '1.2rem',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: 'rgba(255, 193, 7, 0.3)',
                transform: 'scale(1.05)',
            },
        },
        mainContentArea: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '20px',
            flex: 1,
            minHeight: 0,
        },
        leftPanel: {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            minHeight: 0,
        },
        videoPlayerContainer: {
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
        },
        iframe: {
            width: '100%',
            aspectRatio: '16 / 9',
            border: 'none',
        },
        videoInfoContainer: {
            padding: '10px 5px',
        },
        videoTitle: {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            margin: '0 0 10px 0',
            transition: 'color 0.3s ease',
        },
        controlsContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        playbackControls: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
        },
        controlButton: {
            background: 'none',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            cursor: 'pointer',
            fontSize: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: '#fff',
                transform: 'scale(1.1)',
            },
        },
        playPauseButton: {
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            cursor: 'pointer',
            fontSize: '2rem',
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.7)',
            },
        },
        rightPanel: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '15px',
            minHeight: 0,
            boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        },
        tabsContainer: {
            display: 'flex',
            gap: '10px',
            marginBottom: '15px',
            borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
        },
        tabButton: {
            padding: '10px 15px',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: '#aaa',
            fontSize: '1rem',
            borderBottom: '2px solid transparent',
            transition: 'color 0.3s ease, border-color 0.3s ease, transform 0.2s ease',
            '&:hover': {
                color: '#fff',
                transform: 'scale(1.02)',
            },
        },
        tabButtonActive: {
            color: '#fff',
            borderColor: '#fff',
            fontWeight: 'bold',
        },
        contentPanel: {
            flex: 1,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#555 rgba(255,255,255,0.05)',
        },
        apiError: {
            background: 'rgba(220, 53, 69, 0.2)',
            border: '1px solid rgba(220, 53, 69, 0.4)',
            borderRadius: '8px',
            padding: '10px',
            margin: '0 0 15px 0',
            color: '#f8d7da',
            fontSize: '0.9rem',
        },
        searchContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        },
        searchInputGroup: {
            display: 'flex',
            gap: '10px',
        },
        searchInput: {
            flex: 1,
            padding: '10px 15px',
            borderRadius: '20px',
            border: '1px solid #555',
            background: 'rgba(0,0,0,0.5)',
            color: '#fff',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease',
            '&:focus': {
                borderColor: '#3ea6ff',
                boxShadow: '0 0 8px rgba(62, 166, 255, 0.5)',
            },
        },
        searchButton: {
            background: '#3ea6ff',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
            '&:hover': {
                background: '#007bff',
                transform: 'scale(1.05)',
                boxShadow: '0 0 10px rgba(62, 166, 255, 0.7)',
            },
            '&:disabled': {
                background: '#555',
                cursor: 'not-allowed',
                opacity: 0.7,
                transform: 'none',
                boxShadow: 'none',
            },
        },
        customSongButton: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#eee',
            border: '1px solid #555',
            borderRadius: '20px',
            padding: '8px 15px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            textAlign: 'center',
            transition: 'background 0.3s ease, transform 0.2s ease',
            '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
                transform: 'scale(1.02)',
            },
        },
        searchResultsContainer: {
            marginTop: '15px',
        },
        searchResultItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px',
            borderRadius: '8px',
            marginBottom: '5px',
            transition: 'background 0.3s ease, transform 0.2s ease',
            '&:hover': {
                background: 'rgba(255, 255, 255, 0.08)',
            },
        },
        searchResultTitle: {
            flex: 1,
            fontSize: '0.9rem',
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        addSearchResultButton: {
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '15px',
            padding: '5px 12px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            transition: 'background 0.3s ease, transform 0.2s ease',
            '&:hover': {
                background: '#218838',
                transform: 'scale(1.05)',
            },
        },
        playlistItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            cursor: 'pointer',
            borderRadius: '8px',
            marginBottom: '5px',
            border: '1px solid transparent',
            transition: 'background 0.3s ease, border-color 0.3s ease, transform 0.2s ease',
            '&:hover': {
                background: 'rgba(255, 255, 255, 0.05)',
            },
        },
        playlistItemSelected: {
            background: 'rgba(62, 166, 255, 0.2)',
            borderColor: 'rgba(62, 166, 255, 0.5)',
            boxShadow: '0 0 8px rgba(62, 166, 255, 0.3)',
            transform: 'scale(1.01)',
        },
        playlistItemText: {
            flex: 1,
            overflow: 'hidden',
        },
        playlistItemTitle: {
            fontWeight: 'bold',
            fontSize: '0.9rem',
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        playlistItemDetails: {
            fontSize: '0.8rem',
            color: '#aaa',
            opacity: 0.9,
        },
        removeButton: {
            background: 'rgba(220, 53, 69, 0.3)',
            color: '#ff8a8a',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            marginLeft: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.5,
            transition: 'opacity 0.3s ease, background 0.3s ease, transform 0.2s ease',
            '&:hover': {
                opacity: 1,
                background: 'rgba(220, 53, 69, 0.5)',
                transform: 'scale(1.1)',
            },
        },
        loadingSpin: {
            animation: 'spin 1s linear infinite',
            display: 'inline-block',
        },
        setupInfo: {
            fontSize: '0.8rem',
            padding: '12px',
            background: 'rgba(23, 162, 184, 0.1)',
            borderColor: 'rgba(23, 162, 184, 0.3)',
            color: '#17a2b8',
            borderRadius: '8px',
            border: '1px solid rgba(23, 162, 184, 0.3)',
        }
    };

    const currentSong = playlist.find(song => song.id === videoId) || {};

    return (
        <>
            {/* Main Player - Hidden when minimized */}
            <div style={{
                ...styles.playerContainer,
                display: isMinimized ? 'none' : 'flex'
            }}>
                <div style={styles.topBar}>
                    <h2 style={styles.title}>{playerConfig.title}</h2>
                    {/* NEW: Display user name if available */}
                    {userName && <span style={styles.userNameDisplay}>Hello, {userName}!</span>}
                    {/* UPDATED: Button container with minimize button */}
                    <div style={styles.buttonContainer}>
                        <button
                            onClick={handleMinimize}
                            style={styles.minimizeButton}
                            title="Minimize Player"
                        >
                            ➖
                        </button>
                        <button onClick={onClose} style={styles.closeButton} title="Close Player">
                            ✖
                        </button>
                    </div>
                </div>

                <div style={styles.mainContentArea}>
                    {/* Left Panel: Video Player and Controls */}
                    <div style={styles.leftPanel}>
                        <div style={styles.videoPlayerContainer}>
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&mute=0&rel=0&showinfo=0`}
                                title="YouTube video player"
                                style={styles.iframe}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div style={styles.videoInfoContainer}>
                            <h3 style={styles.videoTitle}>{currentSong.title}</h3>
                            <div style={styles.controlsContainer}>
                                <p style={{ margin: 0, color: '#aaa' }}>{currentSong.artist}</p>
                                <div style={styles.playbackControls}>
                                    <button onClick={handlePreviousSong} style={styles.controlButton} title="Previous">
                                        ⏮
                                    </button>
                                    <button onClick={togglePlay} style={styles.playPauseButton} title={isPlaying ? 'Pause' : 'Play'}>
                                        {isPlaying ? '⏸' : '▶'}
                                    </button>
                                    <button onClick={handleNextSong} style={styles.controlButton} title="Next">
                                        ⏭
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Info/Tips Box */}
                        <div style={styles.setupInfo}>
                            <strong>🔧 Setup:</strong> Add your YouTube API key in `playerLogic.js` or a `.env` file to enable search. Current functionality is limited to the default playlist.
                        </div>
                    </div>

                    {/* Right Panel: Playlist and Add Song */}
                    <div style={styles.rightPanel}>
                        <div style={styles.tabsContainer}>
                            <button
                                onClick={() => { setShowVideoList(true); setShowAddSong(false); }}
                                style={{ ...styles.tabButton, ...(showVideoList && styles.tabButtonActive) }}
                            >
                                Playlist ({playlist.length})
                            </button>
                            <button
                                onClick={() => { setShowAddSong(true); setShowVideoList(false); }}
                                style={{ ...styles.tabButton, ...(showAddSong && styles.tabButtonActive) }}
                            >
                                ➕ Add Song
                            </button>
                        </div>

                        <div style={styles.contentPanel}>
                            {/* Playlist View */}
                            {showVideoList && (
                                <div>
                                    {playlist.map((video) => (
                                        <div
                                            key={video.id}
                                            style={{
                                                ...styles.playlistItem,
                                                ...(videoId === video.id && styles.playlistItemSelected)
                                            }}
                                            onClick={() => handleVideoSelect(video.id)}
                                        >
                                            <div style={styles.playlistItemText}>
                                                <div style={styles.playlistItemTitle}>{video.title}</div>
                                                <div style={styles.playlistItemDetails}>{video.artist} {video.duration && `• ${video.duration}`}</div>
                                            </div>
                                            {playlist.length > 1 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFromPlaylist(video.id);
                                                    }}
                                                    style={styles.removeButton}
                                                    title="Remove from playlist"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Song View */}
                            {showAddSong && (
                                <div>
                                    {apiError && <div style={styles.apiError}>⚠️ {apiError}</div>}

                                    <div style={styles.searchContainer}>
                                        <div style={styles.searchInputGroup}>
                                            <input
                                                type="text"
                                                placeholder="Search for songs..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                style={styles.searchInput}
                                            />
                                            <button
                                                onClick={handleSearch}
                                                disabled={isSearching || !searchQuery}
                                                style={styles.searchButton}
                                            >
                                                {isSearching ? <span style={styles.loadingSpin}>⚙️</span> : '🔍'}
                                            </button>
                                        </div>
                                        {/* Updated handleCustomSong call */}
                                        <button onClick={handleCustomSong} style={styles.customSongButton}>
                                            🔗 Add by YouTube URL or ID
                                        </button>
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div style={styles.searchResultsContainer}>
                                            {searchResults.map((result) => (
                                                <div key={result.id} style={styles.searchResultItem}>
                                                    <div style={styles.searchResultTitle}>{result.title}</div>
                                                    <button onClick={() => handleAddToPlaylist(result)} style={styles.addSearchResultButton}>
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

            {/* NEW: Mini Player - Shows when minimized */}
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