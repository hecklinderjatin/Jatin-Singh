// playerLogic.js - Business logic and YouTube API integration

import { songUtils, playerConfig } from './songs.js';

// Helper function to save playlist to local storage
const savePlaylistToLocalStorage = (playlist) => {
    try {
        localStorage.setItem('cosmicVibesPlaylist', JSON.stringify(playlist));
    } catch (error) {
        console.error("Error saving playlist to local storage:", error);
    }
};

// Removed: Helper to save the user's name to local storage
// const saveUserNameToLocalStorage = (userName) => {
//     try {
//         localStorage.setItem('cosmicVibesUserName', userName);
//     } catch (error) {
//         console.error("Error saving user name to local storage:", error);
//     }
// };

// Removed: Helper to load the user's name from local storage
// const loadUserNameFromLocalStorage = () => {
//     try {
//         return localStorage.getItem('cosmicVibesUserName') || ''; // Return empty string if not found
//     } catch (error) {
//         console.error("Error loading user name from local storage:", error);
//         return ''; // Fallback in case of error
//     }
// };


export const usePlayerLogic = () => {
    // Get video durations from YouTube API
    const getVideoDurations = async (videoIds, apiKey) => {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?` +
                `part=contentDetails&id=${videoIds.join(',')}&key=${apiKey}`
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            return data.items.reduce((acc, item) => {
                acc[item.id] = songUtils.formatDuration(item.contentDetails.duration);
                return acc;
            }, {});

        } catch (error) {
            console.error('Duration fetch error:', error);
            return {};
        }
    };

    // YouTube API search function
    const searchYouTube = async (query, onSearchStart, onSearchEnd, onError, onSuccess) => {
        const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || 'YOUR_API_KEY_HERE';

        if (API_KEY === 'YOUR_API_KEY_HERE') {
            onError('Please add your YouTube API key to use search functionality');
            return;
        }

        onSearchStart();
        onError(''); // Clear previous errors

        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?` +
                `part=snippet&maxResults=${playerConfig.maxSearchResults}&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`
            );

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('API quota exceeded or invalid API key');
                } else if (response.status === 400) {
                    throw new Error('Invalid search query');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();

            if (!data.items || data.items.length === 0) {
                onSuccess([]);
                onError('No results found');
                return;
            }

            // Get video IDs for duration lookup
            const videoIds = data.items.map(item => item.id.videoId);
            const durations = await getVideoDurations(videoIds, API_KEY);

            // Transform API response to match component format
            const results = data.items.map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                artist: item.snippet.channelTitle,
                duration: durations[item.id.videoId] || 'Unknown',
                thumbnail: item.snippet.thumbnails.default.url
            }));

            const formattedResults = results.map(songUtils.createSongFromResult);
            onSuccess(formattedResults);

        } catch (error) {
            console.error('YouTube API Error:', error);
            onError(error.message || 'Search failed. Please try again.');
            onSuccess([]);
        } finally {
            onSearchEnd();
        }
    };

    // Playlist management functions - MODIFIED
    const playlistActions = {
        addSong: (playlist, song, setPlaylist) => {
            if (!songUtils.songExists(playlist, song.id)) {
                const updatedPlaylist = [...playlist, song]; // Create new array
                setPlaylist(updatedPlaylist); // Update React state
                savePlaylistToLocalStorage(updatedPlaylist); // Save to local storage
                return true;
            }
            return false;
        },

        removeSong: (playlist, songId, setPlaylist) => {
            const updatedPlaylist = playlist.filter(song => song.id !== songId); // Create new array
            setPlaylist(updatedPlaylist); // Update React state
            savePlaylistToLocalStorage(updatedPlaylist); // Save to local storage
        },

        selectSong: (songId, setVideoId, setIsPlaying) => {
            setVideoId(songId);
            setIsPlaying(true);
        },

        playNext: (playlist, currentId, setVideoId, setIsPlaying) => {
            const nextSong = songUtils.getNextSong(playlist, currentId);
            playlistActions.selectSong(nextSong.id, setVideoId, setIsPlaying);
        },

        playPrevious: (playlist, currentId, setVideoId, setIsPlaying) => {
            const prevSong = songUtils.getPreviousSong(playlist, currentId);
            playlistActions.selectSong(prevSong.id, setVideoId, setIsPlaying);
        }
    };

    // Custom song addition - MODIFIED to remove user name prompt
    const addCustomSong = (playlist, setPlaylist) => { // Removed setUserName prop
        const urlInput = prompt('Enter YouTube URL or Video ID:');
        if (urlInput) {
            const extractedId = songUtils.extractVideoId(urlInput);
            const titleInput = prompt('Enter song title:');
            const artistInput = prompt('Enter artist name:');
            
            // Removed: Prompt for user name and save it
            // const userNameInput = prompt('Enter your name (for display):');
            // if (userNameInput !== null) { // Check if user didn't cancel
            //     saveUserNameToLocalStorage(userNameInput);
            //     setUserName(userNameInput); // Update the user name state in the parent component
            // }

            const customSong = songUtils.createCustomSong(extractedId, titleInput, artistInput);
            playlistActions.addSong(playlist, customSong, setPlaylist);
        }
    };

    return {
        searchYouTube,
        playlistActions,
        addCustomSong,
        // Removed: loadUserNameFromLocalStorage
    };
};