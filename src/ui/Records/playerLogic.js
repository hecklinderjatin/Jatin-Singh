// playerLogic.js - Business logic and YouTube API integration with Public Playlist

import { songUtils, playerConfig } from './songs.js';

export const usePlayerLogic = () => {
    // Extract playlist ID from YouTube URL
    const extractPlaylistId = (url) => {
        const regex = /[&?]list=([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        return match ? match[1] : url; // Return the ID if it's already just an ID
    };

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

        // Debug logging
        console.log('API Key exists:', !!API_KEY);
        console.log('API Key starts with:', API_KEY.substring(0, 10) + '...');
        console.log('Environment:', process.env.NODE_ENV);

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

    // Public YouTube Playlist Management Functions
    const youtubePlaylistAPI = {
        // Get playlist details
        getPlaylistDetails: async (playlistId) => {
            const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

            try {
                const response = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlists?` +
                    `part=snippet&id=${playlistId}&key=${API_KEY}`
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch playlist details: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.items || data.items.length === 0) {
                    throw new Error('Playlist not found or is private');
                }

                return {
                    id: data.items[0].id,
                    title: data.items[0].snippet.title,
                    description: data.items[0].snippet.description,
                    thumbnails: data.items[0].snippet.thumbnails,
                    channelTitle: data.items[0].snippet.channelTitle
                };

            } catch (error) {
                console.error('Get playlist details error:', error);
                throw error;
            }
        },

        // Get all playlist items from a public YouTube playlist
        getPlaylistItems: async (playlistId, maxResults = 50) => {
            const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

            try {
                let allItems = [];
                let nextPageToken = '';

                do {
                    const response = await fetch(
                        `https://www.googleapis.com/youtube/v3/playlistItems?` +
                        `part=snippet&maxResults=${maxResults}&playlistId=${playlistId}&key=${API_KEY}` +
                        (nextPageToken ? `&pageToken=${nextPageToken}` : '')
                    );

                    if (!response.ok) {
                        throw new Error(`Failed to fetch playlist: ${response.status}`);
                    }

                    const data = await response.json();
                    
                    if (!data.items) {
                        break;
                    }

                    allItems = [...allItems, ...data.items];
                    nextPageToken = data.nextPageToken || '';

                } while (nextPageToken && allItems.length < 200); // Limit to 200 items

                // Get video IDs for duration lookup
                const videoIds = allItems.map(item => item.snippet.resourceId.videoId);
                const durations = await getVideoDurations(videoIds, API_KEY);

                // Transform to match your app's format
                const songs = allItems.map((item, index) => ({
                    id: item.snippet.resourceId.videoId,
                    title: item.snippet.title,
                    artist: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails?.default?.url,
                    duration: durations[item.snippet.resourceId.videoId] || 'Unknown',
                    addedBy: 'YouTube Playlist',
                    addedAt: item.snippet.publishedAt,
                    playlistItemId: item.id,
                    position: index
                }));

                return songs;

            } catch (error) {
                console.error('Get playlist items error:', error);
                throw error;
            }
        },

        // Check if playlist is accessible (public)
        validatePlaylist: async (playlistUrl) => {
            try {
                const playlistId = extractPlaylistId(playlistUrl);
                const details = await youtubePlaylistAPI.getPlaylistDetails(playlistId);
                const items = await youtubePlaylistAPI.getPlaylistItems(playlistId, 1);
                
                return {
                    isValid: true,
                    playlistId,
                    details,
                    itemCount: items.length
                };
            } catch (error) {
                return {
                    isValid: false,
                    error: error.message
                };
            }
        },

        // Periodically sync with YouTube playlist to get new songs
        syncFromYouTubePlaylist: async (playlistId, currentPlaylist, setPlaylist) => {
            try {
                const youtubeItems = await youtubePlaylistAPI.getPlaylistItems(playlistId);
                
                // Create a map of current local songs by ID
                const localSongIds = new Set(currentPlaylist.map(song => song.id));
                
                // Find new songs that aren't in local playlist
                const newSongs = youtubeItems.filter(song => !localSongIds.has(song.id));
                
                if (newSongs.length > 0) {
                    // Add new songs to local playlist
                    const updatedPlaylist = [...currentPlaylist, ...newSongs];
                    setPlaylist(updatedPlaylist);
                    
                    return {
                        success: true,
                        newSongsCount: newSongs.length,
                        totalSongs: youtubeItems.length
                    };
                }
                
                return {
                    success: true,
                    newSongsCount: 0,
                    totalSongs: youtubeItems.length
                };

            } catch (error) {
                console.error('Sync from YouTube error:', error);
                throw error;
            }
        },

        // Get playlist statistics
        getPlaylistStats: async (playlistId) => {
            try {
                const items = await youtubePlaylistAPI.getPlaylistItems(playlistId);
                const details = await youtubePlaylistAPI.getPlaylistDetails(playlistId);
                
                // Calculate total duration
                const totalDurationMs = items.reduce((total, song) => {
                    if (song.duration && song.duration !== 'Unknown') {
                        const [minutes, seconds] = song.duration.split(':').map(Number);
                        return total + (minutes * 60 + seconds) * 1000;
                    }
                    return total;
                }, 0);
                
                const hours = Math.floor(totalDurationMs / (1000 * 60 * 60));
                const minutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));
                
                return {
                    songCount: items.length,
                    totalDuration: `${hours}h ${minutes}m`,
                    playlistTitle: details.title,
                    channelTitle: details.channelTitle
                };
                
            } catch (error) {
                console.error('Get playlist stats error:', error);
                throw error;
            }
        }
    };

    // Enhanced playlist management functions
    const playlistActions = {
        addSong: (playlist, song, setPlaylist, addedBy = 'Anonymous') => {
            if (!songUtils.songExists(playlist, song.id)) {
                // Add the addedBy field to the song object
                const songWithUser = {
                    ...song,
                    addedBy: addedBy || 'Anonymous',
                    addedAt: new Date().toISOString(),
                    source: 'manual' // To distinguish from YouTube playlist songs
                };

                const newPlaylist = [...playlist, songWithUser];
                setPlaylist(newPlaylist);
                return true;
            }
            return false;
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
        },

        // Load playlist from public YouTube playlist
        loadFromYoutubePlaylist: async (playlistUrl, setPlaylist, onProgress) => {
            try {
                const playlistId = extractPlaylistId(playlistUrl);
                
                if (onProgress) onProgress('Validating playlist...');
                const validation = await youtubePlaylistAPI.validatePlaylist(playlistUrl);
                
                if (!validation.isValid) {
                    throw new Error(validation.error || 'Invalid playlist');
                }
                
                if (onProgress) onProgress('Loading songs...');
                const songs = await youtubePlaylistAPI.getPlaylistItems(playlistId);
                
                setPlaylist(songs);
                
                if (onProgress) onProgress('Complete!');
                
                return {
                    success: true,
                    playlistId,
                    details: validation.details,
                    songCount: songs.length
                };
                
            } catch (error) {
                console.error('Failed to load YouTube playlist:', error);
                throw error;
            }
        },

        // Sync with YouTube playlist to get new songs
        syncWithYoutube: async (playlistId, currentPlaylist, setPlaylist) => {
            return await youtubePlaylistAPI.syncFromYouTubePlaylist(playlistId, currentPlaylist, setPlaylist);
        }
    };

    // Custom song addition
    const addCustomSong = (playlist, setPlaylist) => {
        const urlInput = prompt('Enter YouTube URL or Video ID:');
        if (urlInput) {
            const extractedId = songUtils.extractVideoId(urlInput);
            const titleInput = prompt('Enter song title:');
            const artistInput = prompt('Enter artist name:');
            const userNameInput = prompt('Enter your name:');

            const customSong = songUtils.createCustomSong(extractedId, titleInput, artistInput);
            playlistActions.addSong(playlist, customSong, setPlaylist, userNameInput);
        }
    };

    // Enhanced function to add song from search results
    const addSongFromSearch = (playlist, song, setPlaylist, userName) => {
        return playlistActions.addSong(playlist, song, setPlaylist, userName);
    };

    return {
        searchYouTube,
        playlistActions,
        addCustomSong,
        addSongFromSearch,
        youtubePlaylistAPI,
        extractPlaylistId
    };
};