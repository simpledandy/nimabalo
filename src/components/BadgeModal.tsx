"use client";

import { useState, useEffect } from 'react';

export type BadgeType = 'nth_user';

interface BadgeModalProps {
  badgeType: BadgeType;
  isOpen: boolean;
  onClose: () => void;
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

export default function BadgeModal({ badgeType, isOpen, onClose }: BadgeModalProps) {
  const [userPosition, setUserPosition] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && badgeType === 'nth_user') {
      // Fetch user position for nth_user badge
      const fetchUserPosition = async () => {
        try {
          const { data: { user } } = await import('@/lib/supabaseClient').then(m => m.supabase.auth.getUser());
          if (user) {
            const { data: profile } = await import('@/lib/supabaseClient').then(m => 
              m.supabase.from('profiles').select('created_at').eq('id', user.id).single()
            );
            
            if (profile) {
              const { count } = await import('@/lib/supabaseClient').then(m =>
                m.supabase.from('profiles').select('*', { count: 'exact', head: true }).lte('created_at', profile.created_at)
              );
              setUserPosition(count || 0);
            }
          }
        } catch (error) {
          console.error('Error fetching user position:', error);
        }
      };
      
      fetchUserPosition();
    }
  }, [isOpen, badgeType]);

  if (!isOpen) return null;

  const config = BADGE_CONFIG[badgeType];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
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
          {/* Special gradient background for special badges
          {config.special && (
            <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-10`} />
          )} 
           
           for the badge icon:
           ${config.special ? 'animate-bounce-slow' : 'animate-scale-in'}
           */}
          
          {/* Badge icon with special animation */}
          <div className={`relative z-10 text-8xl mb-6 `}>
            {config.emoji}
          </div>
          
          {/* Badge title with brand name styling */}
          <h2 className={`relative z-10 text-2xl md:text-3xl font-extrabold mb-4 ${config.textColor} leading-tight`}>
            {(() => {
              let title = config.title;
              
              // Replace {position} placeholder for nth_user badge
              if (badgeType === 'nth_user' && userPosition !== null) {
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
            onClick={onClose}
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
