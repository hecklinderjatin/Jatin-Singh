import React, { useRef, useEffect, useCallback } from 'react';

const StarsBackground = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);

  const createStar = (canvas) => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5 + 0.5,
    alpha: Math.random(),
    alphaChange: (Math.random() - 0.5) * 0.01,
    velocity: {
      y: Math.random() * 0.2 + 0.1,
    },
  });

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

    const starCount = Math.floor((canvas.width * canvas.height) / 3000);
    starsRef.current = Array.from({ length: starCount }, () => createStar(canvas));
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    starsRef.current.forEach((star) => {
      star.y += star.velocity.y;
      star.alpha += star.alphaChange;
      if (star.alpha <= 0 || star.alpha >= 1) star.alphaChange *= -1;
      if (star.y > canvas.height) {
        Object.assign(star, createStar(canvas));
        star.y = 0;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    initializeStars();
    window.addEventListener('resize', initializeStars);
    const animationId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', initializeStars);
      cancelAnimationFrame(animationId);
    };
  }, [initializeStars, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="stars-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -10,
        width: '100%',
        height: '100%',
        background: 'black',
      }}
    />
  );
};

export default StarsBackground;
