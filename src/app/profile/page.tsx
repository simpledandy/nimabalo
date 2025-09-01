"use client";

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';


export default function ProfilePage() {
  const { user, loading } = useSession();
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
      <div className="card">
        <p className="mb-3"> Ko‘rish uchun tizimga kiring.</p>
        <Link href="/auth" className="btn">Kirish sahifasiga o‘tish</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Shaxsiy Ko‘rinish</h1>
      <div className="card space-y-3">
        <div className="grid gap-3">
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div>{user?.email}</div>
          </div>
          <label className="block">
            <span className="text-sm font-medium">Iznom</span>
            <input
              className="input mt-1"
              value={profile?.username ?? ''}
              onChange={(e) => setProfile((p: any) => p ? { ...p, username: e.target.value } : p)}
              placeholder="Betakror taxallusingiz"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">To‘liq ism</span>
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
          {msg && <div className="text-green-600 text-sm">{msg}</div>}
        </div>
        {/* BADGES (disabled for now) */}
        {/* <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Yorliqlaringiz</h2>
          <ul className="flex flex-wrap gap-2">
            <li className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">Birinchi savol</li>
            <li className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Birinchi foydalanuvchi</li>
            <li className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Referral yutug‘i</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}
