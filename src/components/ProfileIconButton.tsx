"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ProfileIconButtonProps {
  userId: string;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
  className?: string;
}

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export default function ProfileIconButton({ 
  userId, 
  size = 'medium', 
  showTooltip = true,
  className = ""
}: ProfileIconButtonProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          setError(error.message);
        } else if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    large: 'w-12 h-12 text-lg'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || profile?.username || 'User';
  const initials = getInitials(displayName);

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse ${className}`} />
    );
  }

  // If there's an error or no profile, show a fallback
  if (error || !profile) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gray-300 text-gray-600 font-bold flex items-center justify-center ${className}`}
        title={showTooltip ? "Profile not available" : undefined}
      >
        <span className="select-none">?</span>
      </div>
    );
  }

  // Use username URL - if no username, link to user ID route
  const profileUrl = profile?.username ? `/${profile.username}` : `/user/${profile.id}`;

  return (
    <Link 
      href={profileUrl}
      className={`${sizeClasses[size]} rounded-full bg-white border-2 border-primary flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg overflow-hidden ${className}`}
      title={showTooltip ? displayName : undefined}
    >
      {profile?.avatar_url ? (
        <img 
          src={profile.avatar_url} 
          alt={displayName}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="select-none text-primary font-bold">{initials}</span>
      )}
    </Link>
  );
}