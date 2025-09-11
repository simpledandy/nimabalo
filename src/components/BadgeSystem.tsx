"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';

export type BadgeType = 'nth_user';

interface Badge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  awarded_at: string;
}

interface BadgeSystemProps {
  showBadge?: BadgeType;
  onBadgeShown?: () => void;
}

const BADGE_CONFIG = {
  nth_user: {
    title: "Siz nimabalo.uzda {position}-foydalanuvchi bo'ldingiz!",
    description: "Tasavvur qiling, millionlab odamlar ishlatayotganda siz bu yorlig'iniz bilan qancha maqtanishingiz mumkin! Eng muhimi, sizda dalil bor - bu yorlig'! Baxtli kashfiyotlar! 🎉",
    emoji: "🤩",
    color: "from-emerald-500 via-teal-500 to-cyan-500",
    bgColor: "bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-700",
    special: true
  }
};

export default function BadgeSystem({ showBadge, onBadgeShown }: BadgeSystemProps) {
  const { user } = useSession();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<BadgeType | null>(null);
  const [loading, setLoading] = useState(false);
  const [userPosition, setUserPosition] = useState<number | null>(null);

  // Fetch user badges
  useEffect(() => {
    if (!user) return;
    
    const fetchBadges = async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .order('awarded_at', { ascending: false });
      
      if (!error && data) {
        setBadges(data);
      }
    };
    
    fetchBadges();
  }, [user]);

  // Fetch user position for nth_user badge
  const fetchUserPosition = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', user.id)
      .single();
    
    if (!error && data) {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', data.created_at);
      
      setUserPosition(count || 0);
    }
  };

  // Show specific badge if requested
  useEffect(() => {
    if (showBadge && !showBadgeModal) {
      setCurrentBadge(showBadge);
      setShowBadgeModal(true);
      
      // Fetch user position for nth_user badge
      if (showBadge === 'nth_user') {
        fetchUserPosition();
      }
      
      if (onBadgeShown) {
        setTimeout(onBadgeShown, 100);
      }
    }
  }, [showBadge, showBadgeModal, onBadgeShown]);

  // Check for new badges
  useEffect(() => {
    if (!user || badges.length === 0) return;

    const checkForNewBadges = async () => {
      // TODO: Add other badge checks here when badge types are expanded
      // Currently only nth_user badge is implemented
    };

    checkForNewBadges();
  }, [user, badges]);

  const handleCloseBadge = () => {
    setShowBadgeModal(false);
    setCurrentBadge(null);
  };

  if (!currentBadge || !showBadgeModal) return null;

  const config = BADGE_CONFIG[currentBadge];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleCloseBadge}
      />
      
      {/* Floating background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce-slow left-[10%] top-[15%] opacity-60" />
        <div className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce-slower left-[80%] top-[20%] opacity-60" />
        <div className="absolute w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-bounce-slowest left-[45%] top-[10%] opacity-60" />
        <div className="absolute w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce-slow right-[15%] bottom-[20%] opacity-60" />
        <div className="absolute w-3.5 h-3.5 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-bounce-slower right-[35%] bottom-[10%] opacity-60" />
      </div>

      {/* Badge Card */}
      <div className="relative mx-auto max-w-lg w-full">
        <div className={`relative rounded-2xl shadow-2xl px-8 py-10 text-center animate-scale-in overflow-hidden ${config.bgColor} border-2 ${config.borderColor}`}>
          {/* Special gradient background for special badges */}
          {(config as any).special && (
            <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-10`} />
          )}
          
          {/* Badge icon with special animation */}
          <div className={`relative z-10 text-8xl mb-6 ${(config as any).special ? 'animate-bounce-slow' : 'animate-scale-in'}`}>
            {config.emoji}
          </div>
          
          {/* Badge title with brand name styling */}
          <h2 className={`relative z-10 text-2xl md:text-3xl font-extrabold mb-4 ${config.textColor} leading-tight`}>
            {(() => {
              let title = config.title;
              
              // Replace {position} placeholder for nth_user badge
              if (currentBadge === 'nth_user' && userPosition !== null) {
                title = title.replace('{position}', userPosition.toString());
              }
              
              return title.split('nimabalo.uz').map((part, index, array) => (
                <span key={index}>
                  {part}
                  {index < array.length - 1 && (
                    <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary animate-glow">
                      nimabalo.uz
                    </span>
                  )}
                </span>
              ));
            })()}
          </h2>
          
          {/* Badge description */}
          <p className={`relative z-10 text-base md:text-lg ${config.textColor} mb-8 leading-relaxed opacity-90`}>
            {config.description}
          </p>
          
          {/* Action button */}
          <button
            className={`relative z-10 inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r ${config.color} text-white`}
            onClick={handleCloseBadge}
          >
            <span className="mr-2 animate-bounce-slow">🎉</span>
            Rahmat!
          </button>

          {/* Decorative elements */}
          <div className="absolute -top-3 -left-3 w-16 h-16 rounded-xl rotate-[-12deg] shadow-lg overflow-hidden opacity-80">
            <div className={`w-full h-1/3 bg-gradient-to-r ${config.color}`} />
            <div className="w-full h-1/3 bg-white" />
            <div className={`w-full h-1/3 bg-gradient-to-r ${config.color}`} />
          </div>
          <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-xl rotate-[15deg] shadow-lg overflow-hidden opacity-80">
            <div className={`w-full h-1/3 bg-gradient-to-r ${config.color}`} />
            <div className="w-full h-1/3 bg-white" />
            <div className={`w-full h-1/3 bg-gradient-to-r ${config.color}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Badge display component for profile and other places
export function BadgeDisplay({ badgeType, size = 'medium' }: { badgeType: BadgeType; size?: 'small' | 'medium' | 'large' }) {
  const config = BADGE_CONFIG[badgeType];
  
  const sizeClasses = {
    small: 'text-sm px-2 py-1',
    medium: 'text-base px-3 py-2',
    large: 'text-lg px-4 py-3'
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 ${sizeClasses[size]} bg-gradient-to-r ${config.color} text-white shadow-md`}>
      <span className={size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'}>
        {config.emoji}
      </span>
      <span className="hidden sm:inline">{config.title.split('nimabalo.uz')[0].trim()}</span>
    </div>
  );
}

// Badge list component for profile page
export function BadgeList({ badges }: { badges: Badge[] }) {
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
