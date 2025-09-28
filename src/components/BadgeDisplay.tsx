"use client";

import { strings, formatString } from '@/lib/strings';

const BADGE_CONFIG = {
  emoji: "🤩",
  color: "from-emerald-500 via-teal-500 to-cyan-500",
  special: true
};

interface BadgeDisplayProps {
  size?: 'small' | 'medium' | 'large';
  showTitle?: boolean;
  className?: string;
  userPosition?: number | null;
}

export default function BadgeDisplay({ 
  size = 'medium', 
  showTitle = false,
  className = "",
  userPosition
}: BadgeDisplayProps) {
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

  const displayTitle = userPosition 
    ? formatString(strings.badge.displayTitle, { position: userPosition })
    : strings.badge.displayTitle;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 ${sizeClasses[size]} bg-gradient-to-r ${BADGE_CONFIG.color} text-white shadow-md ${className}`}>
      <span className={emojiSizes[size]}>
        {BADGE_CONFIG.emoji}
      </span>
      {showTitle && (
        <span className="hidden sm:inline whitespace-nowrap">
          {displayTitle.split('nimabalo.uz')[0].trim()}
        </span>
      )}
    </div>
  );
}

// Badge list component for profile page
export function BadgeList({ userPosition }: { userPosition?: number | null }) {
  if (!userPosition) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">{strings.badge.sectionTitle}</h2>
      <div className="flex flex-wrap gap-3">
        <BadgeDisplay size="medium" userPosition={userPosition} />
      </div>
    </div>
  );
}
