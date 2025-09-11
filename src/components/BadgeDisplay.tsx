"use client";

import { BadgeType } from './BadgeModal';

const BADGE_CONFIG = {
  nth_user: {
    title: "Siz nimabalo.uzda x-foydalanuvchi bo'ldingiz!",
    emoji: "🤩",
    color: "from-emerald-500 via-teal-500 to-cyan-500",
    special: true
  }
};

interface BadgeDisplayProps {
  badgeType: BadgeType;
  size?: 'small' | 'medium' | 'large';
  showTitle?: boolean;
  className?: string;
}

export default function BadgeDisplay({ 
  badgeType, 
  size = 'medium', 
  showTitle = false,
  className = ""
}: BadgeDisplayProps) {
  const config = BADGE_CONFIG[badgeType];
  
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-2',
    large: 'text-base px-4 py-3'
  };

  const emojiSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 ${sizeClasses[size]} bg-gradient-to-r ${config.color} text-white shadow-md ${className}`}>
      <span className={emojiSizes[size]}>
        {config.emoji}
      </span>
      {showTitle && (
        <span className="hidden sm:inline whitespace-nowrap">
          {config.title.split('nimabalo.uz')[0].trim()}
        </span>
      )}
    </div>
  );
}

// Badge list component for profile page
export function BadgeList({ badges }: { badges: Array<{ id: string; badge_type: BadgeType }> }) {
  if (badges.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">Yorliqlaringiz</h2>
      <div className="flex flex-wrap gap-3">
        {badges.map((badge) => (
          <BadgeDisplay key={badge.id} badgeType={badge.badge_type} size="medium" />
        ))}
      </div>
    </div>
  );
}
