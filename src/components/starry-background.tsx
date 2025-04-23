"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface StarryBackgroundProps {
  starCount?: number;
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
}

export const StarryBackground = ({
  starCount = 150,
  minSize = 0.5,
  maxSize = 3,
  minSpeed = 0.05,
  maxSpeed = 0.2,
}: StarryBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  
  const getStarColor = () => {
    switch (theme) {
      case "light":
        return { r: 100, g: 100, b: 180 }; // Subtle blue for light theme
      case "dark":
        return { r: 255, g: 255, b: 255 }; // White for dark theme
      case "dracula":
        return { r: 189, g: 147, b: 249 }; // Purple from dracula theme
      case "nord":
        return { r: 143, g: 188, b: 187 }; // Light blue-green from nord
      case "monokai":
        return { r: 249, g: 38, b: 114 }; // Pink from monokai
      default:
        return { r: 255, g: 255, b: 255 }; // Default white
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let starColor = getStarColor();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(); 
    };

    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: minSize + Math.random() * (maxSize - minSize),
          speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
          opacity: 0.1 + Math.random() * 0.9,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      starColor = getStarColor();
      
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor.r}, ${starColor.g}, ${starColor.b}, ${star.opacity})`;
        ctx.fill();

        star.y += star.speed;

        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
          star.size = minSize + Math.random() * (maxSize - minSize);
          star.speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, starCount, minSize, maxSize, minSpeed, maxSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ position: "fixed", top: 0, left: 0 }}
    />
  );
};