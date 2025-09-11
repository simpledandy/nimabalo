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

export default function ProfileIconButton({ 
  userId, 
  size = 'medium', 
  showTooltip = true,
  className = ""
}: ProfileIconButtonProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (!error && data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  return (
    <Link 
      href={`/profile/${userId}`}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg ${className}`}
      title={showTooltip ? displayName : undefined}
    >
      {profile?.avatar_url ? (
        <img 
          src={profile.avatar_url} 
          alt={displayName}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span className="select-none">{initials}</span>
      )}
    </Link>
  );
}
