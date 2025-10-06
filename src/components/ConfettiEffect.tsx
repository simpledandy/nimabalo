"use client";

import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: number;
}

interface ConfettiEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

export default function ConfettiEffect({ isActive, onComplete }: ConfettiEffectProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    if (isActive) {
      const pieces: ConfettiPiece[] = [];
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          x: Math.random() * 100,
          y: -10,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          rotation: Math.random() * 360,
          velocity: Math.random() * 3 + 2,
        });
      }
      setConfetti(pieces);

      const timer = setTimeout(() => {
        setConfetti([]);
        if (onComplete) onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-float"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: '50%',
            transform: `rotate(${piece.rotation}deg)`,
            animationDuration: `${piece.velocity}s`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}