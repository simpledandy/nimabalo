"use client";

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabaseClient';
import { useBadges } from '@/lib/useBadges';
import { BadgeList } from '@/components/BadgeDisplay';
import Link from 'next/link';


export default function ProfilePage() {
  const { user, loading } = useSession();
  const { badges } = useBadges();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
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
    setMsg(error ? `Xatolik: ${error.message}` : 'Saqlandi!');
  }

  if (!loading && !user) {
    return (
      <div className="card animate-scale-in hover-lift">
        <p className="mb-3"> Ko'rish uchun tizimga kiring.</p>
        <Link href="/auth" className="btn">Kirish sahifasiga o'tish</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <h1 className="text-2xl font-bold text-primary">Shaxsiy Ko'rinish</h1>
      <div className="card space-y-3 hover-lift">
        <div className="grid gap-3">
          <div>
            <div className="text-sm text-neutral">Email</div>
            <div className="text-primary">{user?.email}</div>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-primary">Iznom</span>
            <input
              className="input mt-1"
              value={profile?.username ?? ''}
              onChange={(e) => setProfile((p: any) => p ? { ...p, username: e.target.value } : p)}
              placeholder="Betakror taxallusingiz"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-primary">To'liq ism</span>
            <input
              className="input mt-1"
              value={profile?.full_name ?? ''}
              onChange={(e) => setProfile((p: any) => p ? { ...p, full_name: e.target.value } : p)}
              placeholder="Ismingiz"
            />
          </label>
          <button className="btn w-full text-center" onClick={save} disabled={saving}>
            Saqlash
          </button>
          {msg && <div className="text-success text-sm">{msg}</div>}
        </div>
        {/* Badges */}
        <div className="mt-4">
          <BadgeList badges={badges} />
        </div>
      </div>
    </div>
  );
}
