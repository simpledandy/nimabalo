"use client";

import { useEffect, useState } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export default function SparkleEffect() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles: Sparkle[] = [];
      for (let i = 0; i < 8; i++) {
        newSparkles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 0.5 + 0.5,
          delay: Math.random() * 2,
        });
      }
      setSparkles(newSparkles);
    };

    generateSparkles();
    const interval = setInterval(generateSparkles, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-float opacity-60"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            fontSize: `${sparkle.size}rem`,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${3 + sparkle.delay}s`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
}