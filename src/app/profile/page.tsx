"use client";

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabaseClient';
import { useBadges } from '@/lib/useBadges';
import { strings } from '@/lib/strings';
import { BadgeList } from '@/components/BadgeDisplay';
import ProfileIconButton from '@/components/ProfileIconButton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading } = useSession();
  const { userPosition } = useBadges();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        // Don't auto-redirect - let users stay on profile page to edit if they want
        // They can manually navigate to their username URL if desired
      }
    })();
  }, [user]);

  async function save() {
    if (!user || !profile) return;
    setSaving(true);
    setMsg('');
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username: profile.username?.trim() || null,
      full_name: profile.full_name?.trim() || null,
      avatar_url: profile.avatar_url || null,
    });
    setSaving(false);
    
    if (error) {
      setMsg(`${strings.auth.errorPrefix} ${error.message}`);
    } else {
      setMsg(strings.profile.messages.saved);
      setIsEditing(false); // Exit edit mode after successful save
      // If username was set, redirect to username URL
      if (profile.username?.trim()) {
        setTimeout(() => {
          router.push(`/${profile.username.trim()}`);
        }, 1000);
      }
    }
  }

  const handleEdit = () => {
    setIsEditing(true);
    setMsg(''); // Clear any previous messages
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMsg(''); // Clear any previous messages
    // Reset profile to original values if needed
    if (user) {
      (async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
        }
      })();
    }
  };

  if (!loading && !user) {
    return (
      <div className="card animate-scale-in hover-lift">
        <p className="mb-3">{strings.profile.buttons.loginRequired}</p>
        <Link href="/auth" className="btn">{strings.profile.buttons.goToLogin}</Link>
      </div>
    );
  }

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
                userId={user?.id || ''} 
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
                {profile?.full_name || profile?.username || strings.profile.userProfile}
              </h1>
              <p className="text-white/80 text-lg mb-1">
                @{profile?.username || 'username'}
              </p>
              <p className="text-white/70 text-sm">
                {user?.email}
              </p>
            </div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <h2 className="text-xl font-bold text-primary">{strings.profile.profileInfo}</h2>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  ✏️ Tahrirlash
                </button>
              )}
            </div>
            
            {isEditing ? (
              // Edit Mode
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-primary mb-2 block">{strings.profile.fields.username}</span>
                  <input
                    className="input"
                    value={profile?.username ?? ''}
                    onChange={(e) => setProfile((p: any) => p ? { ...p, username: e.target.value } : p)}
                    placeholder={strings.profile.fields.usernamePlaceholder}
                  />
                </label>
                
                <label className="block">
                  <span className="text-sm font-medium text-primary mb-2 block">{strings.profile.fields.fullName}</span>
                  <input
                    className="input"
                    value={profile?.full_name ?? ''}
                    onChange={(e) => setProfile((p: any) => p ? { ...p, full_name: e.target.value } : p)}
                    placeholder={strings.profile.fields.fullNamePlaceholder}
                  />
                </label>
                
                <div className="flex gap-3">
                  <button 
                    className="btn flex-1 text-center" 
                    onClick={save} 
                    disabled={saving}
                  >
                    {saving ? strings.profile.buttons.saving : strings.profile.buttons.save}
                  </button>
                  <button 
                    className="btn-secondary flex-1 text-center" 
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Bekor qilish
                  </button>
                </div>
                
                {msg && (
                  <div className={`text-sm p-3 rounded-lg ${
                    msg.includes(strings.auth.errorPrefix) ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {msg}
                  </div>
                )}
              </div>
            ) : (
              // Display Mode
              <div className="grid gap-4">
                {profile?.full_name && (
                  <div>
                    <div className="text-sm font-medium text-primary mb-1">{strings.profile.fields.fullName}</div>
                    <div className="text-neutral">{profile.full_name}</div>
                  </div>
                )}
                
                <div>
                  <div className="text-sm font-medium text-primary mb-1">{strings.profile.fields.username}</div>
                  <div className="text-neutral">@{profile?.username || 'username'}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-primary mb-1">{strings.profile.fields.email}</div>
                  <div className="text-neutral">{profile?.email || strings.profile.messages.emailNotShown}</div>
                </div>
              </div>
            )}
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
