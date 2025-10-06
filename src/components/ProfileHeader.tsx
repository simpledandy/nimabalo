"use client";

import Link from 'next/link';
import ProfileIconButton from './ProfileIconButton';
import { strings } from '@/lib/strings';

interface ProfileHeaderProps {
  profile: {
    id: string;
    full_name?: string | null;
    username?: string | null;
    email?: string | null;
  };
  isOwnProfile: boolean;
  userPosition?: number | null;
}

export default function ProfileHeader({ profile, isOwnProfile, userPosition }: ProfileHeaderProps) {
  return (
    <div className="relative bg-gradient-to-r from-primary via-secondary to-accent h-48 rounded-b-3xl overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-end gap-6">
          {/* Profile Avatar */}
          <div className="relative">
            <ProfileIconButton 
              userId={profile.id} 
              size="large" 
              className="w-24 h-24 border-4 border-white shadow-xl"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-white text-sm">✓</span>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 text-white">
            <h1 className="text-3xl font-bold mb-2">
              {profile.full_name || profile.username || strings.ui.user}
            </h1>
            <p className="text-white/80 text-lg mb-1">
              @{profile.username || strings.ui.username}
            </p>
            <p className="text-white/70 text-sm">
              {isOwnProfile ? profile.email || strings.profile.messages.emailNotShown : strings.profile.messages.emailNotShown}
            </p>
          </div>
          
          {/* Edit Button for own profile */}
          {isOwnProfile && (
            <Link href={`/user/${profile.id}/edit`} className="btn-secondary">
              {strings.profile.editProfile}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}