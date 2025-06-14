// MiniPlayer.jsx - Compact floating music player

import React, { useState, useEffect, useCallback } from 'react';

const MiniPlayer = ({ 
    videoId, 
    isPlaying, 
    onTogglePlay, 
    onNext, 
    onPrevious, 
    currentSong = {}, 
    onExpand,
    onClose 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Show mini player with animation
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Handle dragging functionality
    const handleMouseDown = (e) => {
        if (e.target.closest('.mini-player-controls')) return; // Don't drag when clicking controls
        
        setIsDragging(true);
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    // Move handleMouseMove into useCallback to prevent recreation on each render
    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Keep within screen bounds
        const maxX = window.innerWidth - 320; // mini player width
        const maxY = window.innerHeight - 80; // mini player height
        
        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    }, [isDragging, dragOffset]); // Add any dependencies needed for the function

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Add global mouse event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove]); // Now handleMouseMove is properly listed as dependency

    const styles = {
        miniPlayer: {
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: '320px',
            height: '80px',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
            gap: '12px',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            opacity: isVisible ? 1 : 0,
            transform: `translateY(${isVisible ? 0 : 20}px) scale(${isVisible ? 1 : 0.9})`,
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)',
            fontFamily: 'Arial, sans-serif',
        },
        albumArt: {
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            backgroundColor: '#333',
            backgroundImage: `url(https://img.youtube.com/vi/${videoId}/mqdefault.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0,
            border: '2px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
        },
        songInfo: {
            flex: 1,
            minWidth: 0,
            color: '#fff',
            cursor: 'pointer',
        },
        songTitle: {
            fontSize: '14px',
            fontWeight: 'bold',
            margin: '0 0 4px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: '1.2',
        },
        songArtist: {
            fontSize: '12px',
            color: '#aaa',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: '1.2',
        },
        controls: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
        },
        controlButton: {
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            opacity: 0.8,
        },
        playButton: {
            background: '#fff',
            color: '#000',
            fontSize: '14px',
            width: '36px',
            height: '36px',
            boxShadow: '0 2px 8px rgba(255, 255, 255, 0.3)',
        },
        closeButton: {
            fontSize: '12px',
            opacity: 0.6,
            width: '24px',
            height: '24px',
        },
        playingIndicator: {
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            marginLeft: '4px',
        },
        bar: {
            width: '2px',
            backgroundColor: '#3ea6ff',
            borderRadius: '1px',
            animation: isPlaying ? 'audioWaves 1s infinite ease-in-out' : 'none',
        },
        bar1: { height: '8px', animationDelay: '0s' },
        bar2: { height: '12px', animationDelay: '0.2s' },
        bar3: { height: '6px', animationDelay: '0.4s' },
    };

    // Move audioWavesCSS into useCallback if it's a function
    const audioWavesCSS = useCallback(() => {
        // Inject CSS animation
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @keyframes audioWaves {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.3); }
            }
        `;
        document.head.appendChild(styleElement);
        
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []); // Add any dependencies needed for the function

    useEffect(() => {
        audioWavesCSS();
    }, [audioWavesCSS]); // Now audioWavesCSS is properly listed as dependency

    if (!videoId) return null;

    return (
        <div
            style={styles.miniPlayer}
            onMouseDown={handleMouseDown}
        >
            {/* Album Art */}
            <div 
                style={styles.albumArt}
                onClick={onExpand}
                title="Expand player"
            />

            {/* Song Information */}
            <div style={styles.songInfo} onClick={onExpand}>
                <div style={styles.songTitle}>
                    {currentSong.title || 'Unknown Title'}
                    {isPlaying && (
                        <div style={styles.playingIndicator}>
                            <div style={{...styles.bar, ...styles.bar1}}></div>
                            <div style={{...styles.bar, ...styles.bar2}}></div>
                            <div style={{...styles.bar, ...styles.bar3}}></div>
                        </div>
                    )}
                </div>
                <div style={styles.songArtist}>
                    {currentSong.artist || 'Unknown Artist'}
                </div>
            </div>

            {/* Controls */}
            <div className="mini-player-controls" style={styles.controls}>
                <button
                    onClick={onPrevious}
                    style={styles.controlButton}
                    title="Previous"
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                >
                    ⏮
                </button>
                
                <button
                    onClick={onTogglePlay}
                    style={{...styles.controlButton, ...styles.playButton}}
                    title={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>
                
                <button
                    onClick={onNext}
                    style={styles.controlButton}
                    title="Next"
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                >
                    ⏭
                </button>
                
                <button
                    onClick={onClose}
                    style={{...styles.controlButton, ...styles.closeButton}}
                    title="Close mini player"
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                >
                    ✖
                </button>
            </div>
        </div>
    );
};

export default MiniPlayer;