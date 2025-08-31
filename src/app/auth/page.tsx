'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import Link from 'next/link';

export default function AuthPage() {
  const { user } = useSession();

  if (user) {
    return (
      <div className="card">
  <p className="mb-3">Siz tizimga kirdingiz.</p>
        <div className="flex gap-3">
          <Link href="/" className="btn-secondary">Bosh sahifa</Link>
          <Link href="/ask" className="btn">Savol bering</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
  <h1 className="text-xl font-semibold mb-3">Kirish / Ro'yxatdan o'tish</h1>
      <Auth
        supabaseClient={supabase}
        onlyThirdPartyProviders={false}
        providers={['google']}
        appearance={{
          theme: ThemeSupa,
          variables: { default: { colors: { brand: '#2563eb', brandAccent: '#1d4ed8' } } },
        }}
        magicLink
      />
      <p className="text-xs text-gray-500 mt-3">
        Supabase Auth sozlamalaringizda sayt manzilingiz va localhost redirect URL sifatida kiritilganligiga ishonch hosil qiling.
      </p>
    </div>
  );
}
