"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabaseClient';
import { strings } from '@/lib/strings';
import { BadgeList } from '@/components/BadgeDisplay';
import ProfileIconButton from '@/components/ProfileIconButton';
import StatsCard from '@/components/StatsCard';
import UserContentList from '@/components/UserContentList';
import ActivityCard from '@/components/ActivityCard';
import NotFoundPage from '@/components/NotFoundPage';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import Link from 'next/link';

interface UserProfilePageProps {
  identifier: string; // Can be username or userId
  isUsername: boolean; // true if identifier is username, false if userId
}

export default function UserProfilePage({ identifier, isUsername }: UserProfilePageProps) {
  const { user: currentUser } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({ questions: 0, answers: 0 });
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!identifier) return;
    
    const fetchProfile = async () => {
      try {
        let query;
        
        if (isUsername) {
          // Fetch by username
          query = supabase
            .from('profiles')
            .select('*')
            .eq('username', identifier)
            .single();
        } else {
          // Fetch by userId
          query = supabase
            .from('profiles')
            .select('*')
            .eq('id', identifier)
            .single();
        }

        const { data: profileData, error: profileError } = await query;

        if (profileError) {
          setError(strings.userProfile.userNotFound);
          return;
        }

        setProfile(profileData);

        // Fetch user stats
        const [questionsResult, answersResult] = await Promise.all([
          supabase
            .from('questions')
            .select('id')
            .eq('user_id', profileData.id),
          supabase
            .from('answers')
            .select('id')
            .eq('user_id', profileData.id)
        ]);

        setUserStats({
          questions: questionsResult.data?.length || 0,
          answers: answersResult.data?.length || 0
        });

        // Fetch user activities (recent questions and answers)
        const [questionsActivities, answersActivities] = await Promise.all([
          supabase
            .from('questions')
            .select('id, title, created_at')
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('answers')
            .select('id, body, created_at, question_id, questions(id, title)')
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        const activities = [
          ...(questionsActivities.data || []).map(q => ({ ...q, type: 'question' })),
          ...(answersActivities.data || []).map(a => ({ ...a, type: 'answer' }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setUserActivities(activities);

        // Fetch user position for all users
        const positionQuery = supabase
          .from('profiles')
          .select('id')
          .order('created_at', { ascending: true });
        
        const { data: allUsers } = await positionQuery;
        const position = allUsers?.findIndex(user => user.id === profileData.id);
        setUserPosition(position !== undefined && position !== -1 ? position : null);

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(strings.userProfile.genericError);
      } finally {
        setLoading(false);
        setLoadingStats(false);
      }
    };

    fetchProfile();
  }, [identifier, isUsername]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <LoadingSkeleton variant="profile" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <NotFoundPage
        title={strings.userProfile.userNotFound}
        message={error || strings.userProfile.userNotFoundMessage}
        icon="😕"
      />
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

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="grid gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              label={strings.profile.stats.questions}
              value={userStats.questions}
              color="primary"
            />
            <StatsCard
              label={strings.profile.stats.answers}
              value={userStats.answers}
              color="secondary"
            />
            {userPosition !== null && (
              <StatsCard
                label={strings.profile.stats.position}
                value={`#${userPosition}`}
                color="accent"
              />
            )}
          </div>

          {/* Badges Section */}
          <div className="card">
            <BadgeList 
              userPosition={userPosition}
              isOwnProfile={isOwnProfile}
              profileName={profile.full_name || profile.username || 'User'}
            />
          </div>

          {/* Recent Activity */}
          <div className="card hover-lift">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📊</span>
              <h2 className="text-xl font-bold text-primary">{strings.userProfile.recentActivity}</h2>
            </div>
            
            {loadingStats ? (
              <div className="text-center py-8">
                <div className="animate-spin text-2xl mb-2">⏳</div>
                <p className="text-neutral">{strings.userProfile.loading}</p>
              </div>
            ) : userActivities.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-neutral mb-2">{strings.userProfile.noActivity}</p>
                <p className="text-sm text-neutral">{strings.userProfile.noActivitySubtitle}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userActivities.map((activity, index) => (
                  <ActivityCard 
                    key={`${activity.type}-${activity.id}`}
                    activity={activity}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>

          {/* User's Questions Section */}
          <UserContentList 
            userId={profile.id} 
            type="questions" 
            limit={3}
            isOwnProfile={isOwnProfile}
            profileName={profile.full_name || profile.username || 'User'}
          />

          {/* User's Answers Section */}
          <UserContentList 
            userId={profile.id} 
            type="answers" 
            limit={3}
            isOwnProfile={isOwnProfile}
            profileName={profile.full_name || profile.username || 'User'}
          />
        </div>
      </div>
    </div>
  );
}
