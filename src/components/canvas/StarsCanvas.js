import React, { useRef, useEffect, useCallback } from 'react';

const StarsCanvas = ({ onBootAnimationComplete }) => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animationStartTimeRef = useRef(0);
  const bootAnimationTriggeredCallbackRef = useRef(false);
  const starsInitializedRef = useRef(false); // Prevent re-initialization

  // --- CONFIGURATION ---
  const bootInitialSpeedMultiplier = 100;
  const bootFinalSpeedMultiplier = 0.7;
  const bootAnimationDuration = 3000;
  const trailLengthFactor = 0.6;
  const trailFadeOutDuration = 1500;
  const starBaseRadius = 1.6;
  const starBaseVelocity = 0.1;

  const createStar = useCallback((canvas, fixedX) => {
    const isCoolTone = Math.random() < 0.5;
    const colorHue = isCoolTone ? Math.random() * 40 + 200 : Math.random() * 60;
    const colorSaturation = Math.random() * 30 + 70;
    const colorLightness = Math.random() * 30 + 70;

    const radius = Math.random() * starBaseRadius + 0.5;
    const baseVelocityY = (Math.random() * starBaseVelocity + 0.05) * (1 + radius * 2.5);

    return {
      fixedX: fixedX, // This is the star's permanent X position
      x: fixedX,
      y: Math.random() * canvas.height,
      radius: radius,
      alpha: Math.random(),
      alphaChange: (Math.random() - 0.5) * 0.015,
      baseVelocityY: baseVelocityY,
      color: `hsl(${colorHue}, ${colorSaturation}%, ${colorLightness}%)`,
    };
  }, []);

  const initializeStars = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Only create stars once, not on every resize
    if (!starsInitializedRef.current) {
      const starCount = Math.floor((canvas.width * canvas.height) / 2000);
      
      // Pre-generate fixed X positions
      const fixedPositions = [];
      for (let i = 0; i < starCount; i++) {
        fixedPositions.push(Math.random() * canvas.width);
      }
      
      // Create stars with their permanent X positions
      starsRef.current = fixedPositions.map(fixedX => createStar(canvas, fixedX));
      
      starsInitializedRef.current = true;
      animationStartTimeRef.current = Date.now();
    }
  }, [createStar]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - animationStartTimeRef.current;

    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    let currentOverallSpeedMultiplier;
    let currentTrailOpacity;
    let starDotVisibilityFactor;

    const bootTransitionStartTime = bootAnimationDuration - trailFadeOutDuration;

    if (elapsedTime < bootAnimationDuration) {
      const speedProgress = Math.min(1, elapsedTime / bootAnimationDuration);
      const easedSpeedProgress = easeInOutCubic(speedProgress);

      currentOverallSpeedMultiplier = bootInitialSpeedMultiplier * (1 - easedSpeedProgress) + bootFinalSpeedMultiplier * easedSpeedProgress;

      const trailFadeProgress = Math.max(0, (elapsedTime - bootTransitionStartTime) / trailFadeOutDuration);
      const easedTrailFadeProgress = easeInOutCubic(trailFadeProgress);

      currentTrailOpacity = 1 - easedTrailFadeProgress;
      starDotVisibilityFactor = easedTrailFadeProgress;
    } else {
      currentOverallSpeedMultiplier = bootFinalSpeedMultiplier;
      currentTrailOpacity = 0;
      starDotVisibilityFactor = 1;
    }

    if (elapsedTime >= bootAnimationDuration && !bootAnimationTriggeredCallbackRef.current) {
      if (onBootAnimationComplete) {
        onBootAnimationComplete();
      }
      bootAnimationTriggeredCallbackRef.current = true;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    starsRef.current.forEach((star) => {
      // Move star vertically only
      const velocityY = star.baseVelocityY * currentOverallSpeedMultiplier;
      star.y += velocityY;

      // Update alpha for twinkling
      star.alpha += star.alphaChange;
      if (star.alpha <= 0.1 || star.alpha >= 1) {
        star.alphaChange *= -1;
      }

      // Ensure X position never changes from fixed position
      star.x = star.fixedX;

      ctx.beginPath();

      // Draw trail
      if (currentTrailOpacity > 0.01) {
        const trailY = star.y - velocityY * trailLengthFactor;
        const gradient = ctx.createLinearGradient(star.x, star.y, star.x, trailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.alpha * currentTrailOpacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x, trailY);
        ctx.lineWidth = star.radius * 2;
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }

      // Draw star dot
      if (starDotVisibilityFactor > 0.01) {
        const finalStarDotAlpha = star.alpha * starDotVisibilityFactor;
        if (finalStarDotAlpha > 0.01) {
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${star.color.substring(0, star.color.length - 1)}, ${finalStarDotAlpha})`;
          ctx.fill();
        }
      }

      // Reset only Y position when star goes off screen
      if (star.y > canvas.height + star.radius + 100) {
        star.y = -star.radius;
        star.alpha = Math.random();
        // X position (star.fixedX) is NEVER modified
      }
    });

    requestAnimationFrame(animate);
  }, [onBootAnimationComplete]);

  useEffect(() => {
    initializeStars();
    
    // Handle resize without recreating stars
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      
      // Don't recreate stars, just update canvas size
    };
    
    window.addEventListener('resize', handleResize);
    const animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [initializeStars, animate]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        width: '100%',
        height: '100%',
        background: 'black',
      }}
    />
  );
};

export default StarsCanvas;