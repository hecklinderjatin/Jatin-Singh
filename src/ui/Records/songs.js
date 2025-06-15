// songs.js - Song data and playlist management

export const defaultPlaylist = [
    { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley' },
    { id: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee' },
    { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen' },
    { id: 'hTWKbfoikeg', title: 'Smells Like Teen Spirit', artist: 'Nirvana' }
];

// NEW FUNCTION: Load playlist from local storage or fall back to default
export const loadPlaylistFromLocalStorage = () => {
    try {
        const storedPlaylist = localStorage.getItem('cosmicVibesPlaylist');
        // If there's something in local storage, parse it. Otherwise, return the default.
        return storedPlaylist ? JSON.parse(storedPlaylist) : defaultPlaylist;
    } catch (error) {
        console.error("Error loading playlist from local storage:", error);
        // In case of a parsing error, fall back to the default playlist
        return defaultPlaylist;
    }
};


export const playerConfig = {
    defaultVideoId: 'dQw4w9WgXcQ',
    title: 'Cosmic Vibes 🌌',
    description: 'Enjoy relaxing music from the cosmos while you explore the universe.',
    maxSearchResults: 5
};

// Song utility functions (no changes needed here, just keeping it complete)
export const songUtils = {
    // Helper function to format ISO 8601 duration
    formatDuration: (duration) => {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return 'Unknown';

        const hours = (match[1] || '').replace('H', '');
        const minutes = (match[2] || '').replace('M', '');
        const seconds = (match[3] || '').replace('S', '');

        if (hours) {
            return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
        }
        return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
    },

    // Extract video ID from YouTube URL
    extractVideoId: (url) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        return match ? match[1] : url;
    },

    // Check if song exists in playlist
    songExists: (playlist, songId) => {
        return playlist.some(item => item.id === songId);
    },

    // Get next song in playlist
    getNextSong: (playlist, currentId) => {
        const currentIndex = playlist.findIndex(v => v.id === currentId);
        const nextIndex = (currentIndex + 1) % playlist.length;
        return playlist[nextIndex];
    },

    // Get previous song in playlist
    getPreviousSong: (playlist, currentId) => {
        const currentIndex = playlist.findIndex(v => v.id === currentId);
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        return playlist[prevIndex];
    },

    // Create song object from search result
    createSongFromResult: (result) => ({
        id: result.id,
        title: result.title.length > 50
            ? result.title.substring(0, 50) + '...'
            : result.title,
        artist: result.artist || result.channelTitle,
        duration: result.duration || 'Unknown',
        thumbnail: result.thumbnail
    }),

    // Create custom song object
    createCustomSong: (videoId, title, artist) => ({
        id: videoId,
        title: title || 'Custom Song',
        artist: artist || 'Unknown Artist',
        duration: 'Unknown'
    })
};
