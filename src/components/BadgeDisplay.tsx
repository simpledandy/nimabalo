"use client";

import { useState, useEffect } from 'react';
import { strings } from '@/lib/strings';
import AppModal from './AppModal';
import { supabase } from '@/lib/supabaseClient';

const BADGE_CONFIG = {
  emoji: "🤩",
  color: "from-emerald-500 via-teal-500 to-cyan-500",
  special: true
};

interface BadgeDisplayProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  userPosition?: number | null;
  userName?: string;
}

export default function BadgeDisplay({ 
  size = 'medium',
  className = "",
  userPosition,
  userName
}: BadgeDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [position, setPosition] = useState<number | null>(userPosition || null);

  useEffect(() => {
    if (isModalOpen && !userPosition) {
      const fetchUserPosition = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('created_at')
              .eq('id', user.id)
              .single();
            
            if (profile) {
              const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .lte('created_at', profile.created_at);
              setPosition((count || 1) - 1);
            }
          }
        } catch (error) {
          console.error('Error fetching user position:', error);
        }
      };
      fetchUserPosition();
    } else if (userPosition) {
      setPosition(userPosition);
    }
  }, [isModalOpen, userPosition]);

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
      
      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon="🤩"
        maxWidth="lg"
        className="border-2 border-emerald-500/30"
      >
        <div className="text-center relative">
          {/* Floating decorative elements */}
          <div className="pointer-events-none absolute inset-0 -m-8">
            <div className="absolute w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce-slow left-[10%] top-[15%] opacity-60" />
            <div className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce-slower left-[80%] top-[20%] opacity-60" />
            <div className="absolute w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-bounce-slowest left-[45%] top-[10%] opacity-60" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-emerald-700">
            {position !== null ? `${position}-Foydalanuvchi` : 'Foydalanuvchi'}
          </h2>
          <p className="text-base md:text-lg text-emerald-700 mb-8 opacity-90">
            {userName || 'User'} nimabalo saytidan {position !== null ? position : 'n'}-chi bo'lib ro'yxatdan o'tdi!
          </p>
          <button
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            onClick={() => setIsModalOpen(false)}
          >
            <span className="mr-2">🎉</span>
            Rahmat!
          </button>
        </div>
      </AppModal>
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