"use client";

import { BadgeType } from './BadgeModal';
import { useEffect, useState } from 'react';

interface BadgeNotificationProps {
  badgeType: BadgeType;
  isVisible: boolean;
  onClose: () => void;
}

const BADGE_EMOJIS = {
  nth_user: "🤩"
};

export default function BadgeNotification({ badgeType, isVisible, onClose }: BadgeNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-accent/30 p-4 max-w-sm">
        <div className="flex items-center gap-3">
          <div className="text-3xl animate-badge-float">
            {BADGE_EMOJIS[badgeType]}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-primary text-sm">
              Yangi yorliq! 🎉
            </h3>
            <p className="text-xs text-neutral mt-1">
              Siz yangi yorliq qo'shdingiz!
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral hover:text-primary transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-badge-shine" />
        </div>
      </div>
    </div>
  );
}
