'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { useBadges } from '@/lib/useBadges';
import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ToastContext';
import Link from 'next/link';
import BadgeModal from '@/components/BadgeModal';

export default function AuthPage() {
  const { user } = useSession();
  const { newBadge, clearNewBadge } = useBadges();
  const { addToast } = useToast();
  const greeted = useRef(false);

  useEffect(() => {
    if (user && !greeted.current) {
      addToast("Xush kelibsiz!", "success");
      greeted.current = true;
    }
  }, [user, addToast]);

  // Handle URL error parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (error && errorDescription) {
      const decodedError = decodeURIComponent(errorDescription);
      addToast(`Xatolik: ${decodedError}`, "error");
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [addToast]);

  if (user) {
    return (
      <div className="card animate-scale-in hover-lift">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce-slow">🎉</div>
          <p className="mb-3 text-neutral">Siz tizimga kirdingiz!</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="btn-secondary">Bosh sahifa</Link>
            <Link href="/ask" className="btn">Savol bering</Link>
                  </div>
      </div>

      {/* Badge Modal */}
      <BadgeModal
        badgeType={newBadge!}
        isOpen={!!newBadge}
        onClose={clearNewBadge}
      />
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 relative overflow-hidden">
      {/* Playful background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-3xl opacity-10 animate-bounce-slow">🔐</div>
        <div className="absolute top-40 right-20 text-2xl opacity-10 animate-bounce-slower">✨</div>
        <div className="absolute bottom-40 left-20 text-2xl opacity-10 animate-bounce-slowest">🚀</div>
        <div className="absolute bottom-20 right-10 text-3xl opacity-10 animate-bounce-slow">💫</div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-24 max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="text-6xl mb-4 animate-bounce-slow">🌟</div>
          <h1 className="text-3xl font-extrabold text-primary mb-2">
            Xush kelibsiz!
          </h1>
          <p className="text-lg text-neutral">
            Savollaringizga javob toping yoki boshqalarga yordam bering
          </p>
        </div>

        <div className="card uzbek-pattern animate-fade-in-up hover-lift">
          <div className="text-center mb-6">
            <div className="text-3xl mb-3 animate-bounce-slow">🎯</div>
            <h2 className="text-xl font-semibold text-primary">Kirish / Ro'yxatdan o'tish</h2>
            <p className="text-sm text-neutral mt-2">
              Tezda hisob yarating va barcha imkoniyatlardan foydalaning!
            </p>
          </div>
          
          <Auth
            supabaseClient={supabase}
            onlyThirdPartyProviders={false}
            providers={['google']}
            appearance={{
              theme: ThemeSupa,
              variables: { 
                default: { 
                  colors: { 
                    brand: 'var(--color-primary)', 
                    brandAccent: 'var(--color-secondary)' 
                  } 
                } 
              },
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
                  loading_button_label: "Yuborilmoqda...",
                  link_text: "Magic link yuborish"
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

        {/* Fun tip */}
        <div className="text-center mt-6 animate-fade-in-up" style={{animationDelay: '600ms'}}>
          <div className="text-2xl mb-2 animate-bounce-slow">💡</div>
          <p className="text-sm text-accent">
            Hisob yaratish bepul va faqat bir necha soniya!
          </p>
        </div>
      </div>

      {/* Badge Modal */}
      <BadgeModal
        badgeType={newBadge!}
        isOpen={!!newBadge}
        onClose={clearNewBadge}
      />
    </div>
  );
}
