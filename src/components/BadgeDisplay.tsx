"use client";

import { useState } from 'react';
import { strings, formatString } from '@/lib/strings';
import BadgeModal from './BadgeModal';

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
  userName?: string;
}

export default function BadgeDisplay({ 
  size = 'medium', 
  showTitle = false,
  className = "",
  userPosition,
  userName
}: BadgeDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const displayTitle = userPosition !== null && userPosition !== undefined
    ? formatString(strings.badge.displayTitle, { position: userPosition })
    : strings.badge.displayTitle;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`card hover-lift transition-all duration-300 cursor-pointer ${sizeClasses[size]} bg-gradient-to-r ${BADGE_CONFIG.color} text-white shadow-md hover:shadow-lg rounded-2xl ${className}`}
      >
        <div className="flex items-center justify-center gap-2">
          <span className={emojiSizes[size]}>
            {BADGE_CONFIG.emoji}
          </span>
          <span className="font-bold text-lg">
            #{userPosition}
          </span>
        </div>
      </button>
      
      <BadgeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userPosition={userPosition}
        userName={userName}
      />
    </>
  );
}

// Badge list component for profile page
export function BadgeList({ 
  userPosition, 
  isOwnProfile = false, 
  profileName = '' 
}: { 
  userPosition?: number | null;
  isOwnProfile?: boolean;
  profileName?: string;
}) {
  if (!userPosition) return null;

  const getTitle = () => {
    if (isOwnProfile) {
      return strings.badge.sectionTitle; // "Yorliqlaringiz"
    } else {
      return `${profileName}ning yorliqlari`; // "[User]'s badges"
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🏅</span>
        <h2 className="text-xl font-bold text-primary">{getTitle()}</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        <BadgeDisplay size="medium" userPosition={userPosition} userName={profileName} />
      </div>
    </div>
  );
}
