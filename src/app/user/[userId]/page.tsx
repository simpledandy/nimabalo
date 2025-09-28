"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabaseClient';
import { strings } from '@/lib/strings';
import { BadgeList } from '@/components/BadgeDisplay';
import ProfileIconButton from '@/components/ProfileIconButton';
import Link from 'next/link';

export default function UserProfileByIdPage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId as string;
  const { user: currentUser } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const fetchProfile = async () => {
      try {
        // Fetch user profile by user ID
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          setError(strings.errors.userNotFound);
          return;
        }

        setProfile(profileData);

        // Get user position
        if (profileData?.created_at) {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .lte('created_at', profileData.created_at);
          
          setUserPosition(count || 0);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
        <div className="card space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="card animate-scale-in hover-lift text-center">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-primary mb-2">{strings.errors.userNotFound}</h2>
        <p className="text-neutral mb-4">{error || strings.errors.userNotFoundMessage}</p>
        <Link href="/" className="btn">{strings.errors.goHome}</Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 animate-fade-in-up">
      {/* Profile Header */}
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
                {profile.full_name || profile.username || strings.profile.userProfile}
              </h1>
              <p className="text-white/80 text-lg mb-1">
                @{profile.username || 'username'}
              </p>
              <p className="text-white/70 text-sm">
                {isOwnProfile ? profile.email || strings.profile.messages.emailNotShown : strings.profile.messages.emailNotShownPublic}
              </p>
            </div>
            
            {/* Edit Button for own profile */}
            {isOwnProfile && (
              <Link href="/profile" className="btn-secondary">
                {strings.profile.editProfile}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="grid gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center hover-lift">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-neutral">{strings.profile.stats.questions}</div>
            </div>
            <div className="card text-center hover-lift">
              <div className="text-3xl font-bold text-secondary mb-2">0</div>
              <div className="text-sm text-neutral">{strings.profile.stats.answers}</div>
            </div>
            <div className="card text-center hover-lift">
              <div className="text-3xl font-bold text-accent mb-2">{userPosition || 0}</div>
              <div className="text-sm text-neutral">{strings.profile.stats.position}</div>
            </div>
          </div>

          {/* Profile Info Card */}
          <div className="card space-y-6 hover-lift">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <h2 className="text-xl font-bold text-primary">{strings.profile.profileInfo}</h2>
            </div>
            
            <div className="grid gap-4">
              {profile.full_name && (
                <div>
                  <div className="text-sm font-medium text-primary mb-1">{strings.profile.fields.fullName}</div>
                  <div className="text-neutral">{profile.full_name}</div>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium text-primary mb-1">{strings.profile.fields.username}</div>
                <div className="text-neutral">@{profile.username || 'username'}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-primary mb-1">{strings.profile.fields.email}</div>
                <div className="text-neutral">{isOwnProfile ? profile.email || strings.profile.messages.emailNotShown : strings.profile.messages.emailNotShownPublic}</div>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="card hover-lift">
            <BadgeList userPosition={userPosition} />
          </div>
        </div>
      </div>
    </div>
  );
}
