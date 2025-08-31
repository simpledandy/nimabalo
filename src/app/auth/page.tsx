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
        localization={{
          variables: {
            sign_in: {
              email_label: "Email manzilingiz",
              password_label: "Parol",
              email_input_placeholder: "Email kiriting",
              password_input_placeholder: "Parol kiriting",
              button_label: "Kirish",
              link_text: "Kirishga qaytish",
              loading_button_label: "Kirilmoqda...",
              social_provider_text: "{provider} orqali kirish",
            },
            sign_up: {
              email_label: "Email manzilingiz",
              password_label: "Parol",
              email_input_placeholder: "Email kiriting",
              password_input_placeholder: "Parol yarating",
              button_label: "Ro'yxatdan o'tish",
              loading_button_label: "Yuborilmoqda...",
              social_provider_text: "{provider} orqali ro'yxatdan o'tish",
              link_text: "Ro'yxatdan o'tishga qaytish"
            },
            forgotten_password: {
              email_label: "Email manzilingiz",
              email_input_placeholder: "Email kiriting",
              button_label: "Parolni tiklash",
              link_text: "Parolni unutdingizmi?",
              loading_button_label: "Yuborilmoqda..."
            },
            magic_link: {
              email_input_label: "Email manzilingiz",
              email_input_placeholder: "Email kiriting",
              button_label: "Magic link yuborish",
              loading_button_label: "Yuborilmoqda..."
            },
            update_password: {
              password_label: "Yangi parol",
              password_input_placeholder: "Yangi parol kiriting",
              button_label: "Parolni yangilash",
              loading_button_label: "Yuborilmoqda..."
            },
            verify_otp: {
              email_input_label: "Email manzilingiz",
              email_input_placeholder: "Email kiriting",
              button_label: "Tasdiqlash kodini yuborish",
              loading_button_label: "Yuborilmoqda..."
            },
          }
        }}
      />
    </div>
  );
}
