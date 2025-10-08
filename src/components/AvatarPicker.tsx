"use client";

import { useState, useEffect } from 'react';

interface AvatarPickerProps {
  seed: string; // Username or email to generate consistent avatars
  value?: string;
  onChange: (avatarUrl: string) => void;
  className?: string;
}

// DiceBear avatar styles - free, no API key needed
const avatarStyles = [
  { id: 'avataaars', name: 'Avataaars', emoji: '👤' },
  { id: 'bottts', name: 'Bottts', emoji: '🤖' },
  { id: 'identicon', name: 'Identicon', emoji: '🔷' },
  { id: 'initials', name: 'Initials', emoji: '🔤' },
  { id: 'lorelei', name: 'Lorelei', emoji: '👩' },
  { id: 'micah', name: 'Micah', emoji: '😊' },
  { id: 'personas', name: 'Personas', emoji: '🎭' },
  { id: 'pixel-art', name: 'Pixel Art', emoji: '🎮' }
];

// Generate avatar URL
const getAvatarUrl = (style: string, seed: string) => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`;
};

export default function AvatarPicker({ seed, value, onChange, className = "" }: AvatarPickerProps) {
  // Extract style from existing URL if provided, otherwise default to first style
  const getStyleFromUrl = (url?: string): string => {
    if (!url) return avatarStyles[0].id;
    try {
      const match = url.match(/dicebear\.com\/7\.x\/([^/]+)\//);
      return match ? match[1] : avatarStyles[0].id;
    } catch {
      return avatarStyles[0].id;
    }
  };

  const [selectedStyle, setSelectedStyle] = useState(getStyleFromUrl(value));
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onChange(getAvatarUrl(selectedStyle, seed));
  }, [selectedStyle, seed, onChange]);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    setIsExpanded(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar Display */}
      <div className="text-center">
        <div className="inline-block relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-xl hover:scale-105 transition-transform duration-300 bg-white">
            <img 
              src={getAvatarUrl(selectedStyle, seed)} 
              alt="Your avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute bottom-0 right-0 bg-accent text-white rounded-full p-2 shadow-lg hover:bg-secondary transition-colors"
            title="Change avatar style"
          >
            <span className="text-xl">🎨</span>
          </button>
        </div>
        <p className="text-sm text-neutral mt-3">
          {avatarStyles.find(s => s.id === selectedStyle)?.name} style
        </p>
      </div>

      {/* Style Selector */}
      {isExpanded && (
        <div className="animate-scale-in">
          <h3 className="text-sm font-semibold text-primary mb-3 text-center">
            Choose your avatar style:
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {avatarStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ${
                  selectedStyle === style.id
                    ? 'bg-accent text-white shadow-lg scale-105'
                    : 'bg-light hover:bg-accent/10 hover:scale-105'
                }`}
                title={style.name}
              >
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                  selectedStyle === style.id ? 'border-white' : 'border-gray-300'
                }`}>
                  <img 
                    src={getAvatarUrl(style.id, seed)} 
                    alt={style.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-medium line-clamp-1">
                  {style.emoji}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral text-center mt-3">
            💡 Your avatar is unique to you! It will look the same everywhere.
          </p>
        </div>
      )}
    </div>
  );
}

