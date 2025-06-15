// components/animations/GalaxyBootAnimation.js
import React, { useRef, useEffect, useCallback } from 'react';

const GalaxyBootAnimation = ({ onAnimationComplete }) => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animationStartTimeRef = useRef(0);

  const initialSpeed = 50; // Initial speed multiplier for the boot animation
  const finalSpeed = 0.5;   // Speed multiplier after the animation
  const animationDuration = 3000; // Duration of the fast travel effect in milliseconds (3 seconds)

  // Helper to create a new star, including its initial properties
  const createStar = useCallback((canvas) => {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height, // Stars can start anywhere
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      alphaChange: (Math.random() - 0.5) * 0.01, // For subtle flickering
    };
  }, []);

  // Initializes the canvas and creates the initial set of stars
  const initializeStars = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.scale(dpr, dpr);

    const starCount = Math.floor((canvas.width * canvas.height) / 1000); // More stars for the intense effect
    starsRef.current = Array.from({ length: starCount }, () => createStar(canvas));

    // Reset animation start time on re-initialization (e.g., resize)
    animationStartTimeRef.current = Date.now();
  }, [createStar]);

  // The main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - animationStartTimeRef.current;

    let currentSpeedMultiplier = initialSpeed;

    if (elapsedTime < animationDuration) {
      // During the boot animation, ease out the speed
      const progress = elapsedTime / animationDuration; // 0 to 1
      // Using an ease-out cubic function for smoother deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      currentSpeedMultiplier = initialSpeed * (1 - easedProgress) + finalSpeed * easedProgress;
      currentSpeedMultiplier = Math.max(currentSpeedMultiplier, finalSpeed); // Ensure it doesn't go below final speed
    } else {
      // After boot animation, settle to final speed and notify parent
      currentSpeedMultiplier = finalSpeed;
      if (onAnimationComplete) {
        onAnimationComplete();
        // Set onAnimationComplete to null to prevent repeated calls
        onAnimationComplete = null;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

    starsRef.current.forEach((star) => {
      // Move stars downwards, simulating forward travel
      star.y += currentSpeedMultiplier * (star.radius * 0.5 + 0.5); // Faster stars are bigger or closer

      // Update alpha for flickering
      star.alpha += star.alphaChange;
      if (star.alpha <= 0.1 || star.alpha >= 1) star.alphaChange *= -1; // Keep alpha within visible range

      // If a star moves off the bottom, reset it to the top
      if (star.y > canvas.height) {
        Object.assign(star, createStar(canvas));
        star.y = -star.radius; // Start slightly above the canvas
      }

      // Draw the star
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(animate); // Continue the animation loop
  }, [animationDuration, initialSpeed, finalSpeed, onAnimationComplete, createStar]);

  useEffect(() => {
    initializeStars(); // Initialize stars on component mount
    window.addEventListener('resize', initializeStars); // Re-initialize on window resize

    const animationFrameId = requestAnimationFrame(animate); // Start the animation loop

    // Cleanup function: remove event listener and cancel animation frame
    return () => {
      window.removeEventListener('resize', initializeStars);
      cancelAnimationFrame(animationFrameId);
    };
  }, [initializeStars, animate]); // Dependencies for useEffect

  return (
    <canvas
      ref={canvasRef}
      className="boot-animation-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 20, // Ensure it's above other content during the boot
        width: '100%',
        height: '100%',
        background: 'black', // Explicit black background for space effect
      }}
    />
  );
};

export default GalaxyBootAnimation;
