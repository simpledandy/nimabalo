"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabaseClient';
import { BadgeList } from '@/components/BadgeDisplay';
import Link from 'next/link';

export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId as string;
  const { user: currentUser } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const fetchProfile = async () => {
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          setError('Foydalanuvchi topilmadi');
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
        <h2 className="text-xl font-bold text-primary mb-2">Foydalanuvchi topilmadi</h2>
        <p className="text-neutral mb-4">{error || 'Bu foydalanuvchi mavjud emas'}</p>
        <Link href="/" className="btn">Bosh sahifaga qaytish</Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">
          {isOwnProfile ? 'Shaxsiy Ko\'rinish' : 'Foydalanuvchi Profili'}
        </h1>
        {isOwnProfile && (
          <Link href="/profile" className="btn-secondary">
            Tahrirlash
          </Link>
        )}
      </div>
      
      <div className="card space-y-3 hover-lift">
        <div className="grid gap-3">
          <div>
            <div className="text-sm text-neutral">Email</div>
            <div className="text-primary">{profile.email || 'Ko\'rsatilmagan'}</div>
          </div>
          
          {profile.username && (
            <div>
              <div className="text-sm text-neutral">Iznom</div>
              <div className="text-primary">@{profile.username}</div>
            </div>
          )}
          
          {profile.full_name && (
            <div>
              <div className="text-sm text-neutral">To'liq ism</div>
              <div className="text-primary">{profile.full_name}</div>
            </div>
          )}
        </div>
        
        {/* Badges */}
        <div className="mt-4">
          <BadgeList userPosition={userPosition} />
        </div>
      </div>
    </div>
  );
}
