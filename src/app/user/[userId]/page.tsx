"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabaseClient';
import { strings } from '@/lib/strings';
import { BadgeList } from '@/components/BadgeDisplay';
import ProfileIconButton from '@/components/ProfileIconButton';
import StatsCard from '@/components/StatsCard';
import UserContentList from '@/components/UserContentList';
import ActivityCard from '@/components/ActivityCard';
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
  const [userStats, setUserStats] = useState({ questions: 0, answers: 0 });
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

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

        // Fetch user statistics and activities
        setLoadingStats(true);
        try {
          // Fetch user statistics
          const [questionsResult, answersResult] = await Promise.all([
            supabase.from('questions').select('id', { count: 'exact' }).eq('user_id', userId),
            supabase.from('answers').select('id', { count: 'exact' }).eq('user_id', userId)
          ]);

          setUserStats({
            questions: questionsResult.count || 0,
            answers: answersResult.count || 0
          });

          // Fetch recent activities (last 10 questions and answers)
          const [recentQuestions, recentAnswers] = await Promise.all([
            supabase
              .from('questions')
              .select('id, title, created_at')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(5),
            supabase
              .from('answers')
              .select('id, body, created_at, question_id, questions!inner(title)')
              .eq('user_id', userId)
              .order('created_at', { ascending: false })
              .limit(5)
          ]);

          // Combine and sort activities by date
          const activities = [
            ...(recentQuestions.data || []).map(q => ({ ...q, type: 'question' })),
            ...(recentAnswers.data || []).map(a => ({ ...a, type: 'answer' }))
          ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
           .slice(0, 10);

          setUserActivities(activities);
        } catch (error) {
          console.error('Error fetching user stats:', error);
        } finally {
          setLoadingStats(false);
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
              <Link href={`/user/${profile.id}`} className="btn-secondary">
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
              value={userStats.questions}
              label={strings.profile.stats.questions}
              color="primary"
              loading={loadingStats}
            />
            <StatsCard 
              value={userStats.answers}
              label={strings.profile.stats.answers}
              color="secondary"
              loading={loadingStats}
            />
            <StatsCard 
              value={userPosition || 0}
              label={strings.profile.stats.position}
              color="accent"
            />
          </div>

          {/* Badges Section */}
          <div className="card hover-lift">
            <BadgeList 
              userPosition={userPosition} 
              isOwnProfile={isOwnProfile}
              profileName={profile.full_name || profile.username || 'User'}
            />
          </div>

          {/* Recent Activity Section */}
          <div className="card hover-lift">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📊</span>
              <h2 className="text-xl font-bold text-primary">So'nggi faoliyat</h2>
            </div>
            
            {loadingStats ? (
              <div className="text-center py-8">
                <div className="animate-spin text-2xl mb-2">⏳</div>
                <p className="text-neutral">Yuklanmoqda...</p>
              </div>
            ) : userActivities.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-neutral mb-2">Hali faoliyat yo'q</p>
                <p className="text-sm text-neutral">Savol bering yoki javob yozing!</p>
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
            userId={userId} 
            type="questions" 
            limit={3}
            isOwnProfile={isOwnProfile}
            profileName={profile.full_name || profile.username || 'User'}
          />

          {/* User's Answers Section */}
          <UserContentList 
            userId={userId} 
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
