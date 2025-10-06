'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabaseClient';
import { useSession } from '@/lib/useSession';
import { useBadges } from '@/lib/useBadges';
import { strings } from '@/lib/strings';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ToastContext';
import Link from 'next/link';
import BadgeModal from '@/components/BadgeModal';
import UsernameSetup from '@/components/UsernameSetup';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { user } = useSession();
  const { newBadge, clearNewBadge, userPosition } = useBadges();
  const { addToast } = useToast();
  const router = useRouter();
  const greeted = useRef(false);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);
  const [needsUsernameSetup, setNeedsUsernameSetup] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const tgBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  // Telegram: consume session tokens and set Supabase session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const tgEmail = params.get('tg_email');
    const tgPw = params.get('tg_pw');
    if (!accessToken || !refreshToken) return;

    (async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        addToast(strings.auth.validationErrors.genericError, 'error');
      }
      // Clean URL to avoid reprocessing
      window.history.replaceState({}, document.title, window.location.pathname);
    })();
  }, [addToast]);

  // Telegram: fallback flow via email/password if provided
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tgEmail = params.get('tg_email');
    const tgPw = params.get('tg_pw');
    if (!tgEmail || !tgPw) return;

    (async () => {
      const { error } = await supabase.auth.signInWithPassword({ email: tgEmail, password: tgPw });
      if (error) {
        addToast(strings.auth.validationErrors.genericError, 'error');
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    })();
  }, [addToast]);

  // Check if user needs username setup
  useEffect(() => {
    if (!user) return;

    const checkUsernameSetup = async () => {
      let retries = 0;
      const maxRetries = 5;
      
      while (retries < maxRetries) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist yet, wait and retry
          retries++;
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }

        if (!profile?.username) {
          setNeedsUsernameSetup(true);
          setShowUsernameSetup(true);
          return;
        }

        // Set user name for badge modal
        setUserName(profile.full_name || profile.username || 'User');

        // User has username, greet them
        if (!greeted.current) {
          addToast(strings.auth.welcome, "success");
          greeted.current = true;
        }
        return;
      }
      
      // If we've exhausted retries, assume no username
      setNeedsUsernameSetup(true);
      setShowUsernameSetup(true);
    };

    checkUsernameSetup();
  }, [user, addToast]);

  // Function to translate Supabase errors to Uzbek
  const translateAuthError = (error: any): string => {
    if (!error) return strings.auth.validationErrors.genericError;
    
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code || '';
    
    // Check for specific error patterns
    if (errorMessage.includes('password') && errorMessage.includes('length')) {
      return strings.auth.validationErrors.passwordTooShort;
    }
    if (errorMessage.includes('invalid email')) {
      return strings.auth.validationErrors.emailInvalid;
    }
    if (errorMessage.includes('user already registered') || errorMessage.includes('already registered')) {
      return strings.auth.validationErrors.userAlreadyExists;
    }
    if (errorMessage.includes('invalid login credentials') || errorMessage.includes('wrong password')) {
      return strings.auth.validationErrors.invalidCredentials;
    }
    if (errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
      return strings.auth.validationErrors.tooManyRequests;
    }
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return strings.auth.validationErrors.networkError;
    }
    if (errorCode === 'signup_disabled') {
      return strings.auth.validationErrors.signupDisabled;
    }
    if (errorCode === 'email_not_confirmed') {
      return strings.auth.validationErrors.emailNotConfirmed;
    }
    if (errorMessage.includes('weak password') || errorMessage.includes('password is too weak')) {
      return strings.auth.validationErrors.weakPassword;
    }
    
    // Default fallback
    return strings.auth.validationErrors.genericError;
  };

  // Handle URL error parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    const message = urlParams.get('message');
    
    if (error) {
      let errorMessage = '';
      
      if (message) {
        // Use the specific message if provided
        errorMessage = decodeURIComponent(message);
      } else if (errorDescription) {
        // Fall back to error description
        const decodedError = decodeURIComponent(errorDescription);
        errorMessage = translateAuthError({ message: decodedError });
      } else {
        // Use error code to determine message
        errorMessage = getErrorMessageByCode(error);
      }
      
      addToast(errorMessage, "error");
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [addToast]);

  // Function to get error message by error code
  const getErrorMessageByCode = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      'invalid_token': 'Noto\'g\'ri yoki yo\'qolgan kirish havolasi',
      'token_expired': 'Kirish havolasi muddati tugagan. Yangi havola oling',
      'server_config': 'Server sozlamalarida muammo',
      'create_user_failed': 'Foydalanuvchi yaratishda muammo',
      'no_user': 'Foydalanuvchi topilmadi',
      'pw_set_failed': 'Parol o\'rnatishda muammo',
      'unexpected': 'Kutilmagan xatolik yuz berdi'
    };
    
    return errorMessages[errorCode] || 'Noma\'lum xatolik yuz berdi';
  };

  // Listen for auth state changes and handle errors
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Handle sign out if needed
      } else if (event === 'SIGNED_IN') {
        // Handle successful sign in
        if (!greeted.current) {
          addToast(strings.auth.welcome, "success");
          greeted.current = true;
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Handle token refresh
      }
    });

    return () => subscription.unsubscribe();
  }, [addToast]);

  // Override Supabase Auth UI error display
  useEffect(() => {
    const handleAuthErrors = () => {
      // Look for Supabase Auth UI error messages and replace them
      const errorElements = document.querySelectorAll('[data-testid="error-message"], .supabase-auth-ui_ui-message, .error-message, [role="alert"], .error');
      errorElements.forEach((element) => {
        const text = element.textContent?.toLowerCase() || '';
        if (text.includes('invalid login credentials') || text.includes('invalid credentials')) {
          element.textContent = strings.auth.validationErrors.invalidCredentials;
        } else if (text.includes('user already registered') || text.includes('already registered')) {
          element.textContent = strings.auth.validationErrors.userAlreadyExists;
        } else if (text.includes('invalid email')) {
          element.textContent = strings.auth.validationErrors.emailInvalid;
        } else if (text.includes('password') && text.includes('length')) {
          element.textContent = strings.auth.validationErrors.passwordTooShort;
        } else if (text.includes('too many requests') || text.includes('rate limit')) {
          element.textContent = strings.auth.validationErrors.tooManyRequests;
        } else if (text.includes('network') || text.includes('connection')) {
          element.textContent = strings.auth.validationErrors.networkError;
        } else if (text.includes('weak password')) {
          element.textContent = strings.auth.validationErrors.weakPassword;
        }
      });
    };

    // Run immediately and then periodically
    handleAuthErrors();
    const interval = setInterval(handleAuthErrors, 500);
    
    // Also use MutationObserver to catch dynamically added errors
    const observer = new MutationObserver(() => {
      handleAuthErrors();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  const handleUsernameSetupComplete = (username: string) => {
    setShowUsernameSetup(false);
    setNeedsUsernameSetup(false);
    addToast(`Welcome to Nimabalo, @${username}! 🎉`, "success");
    router.push(`/${username}`);
  };

  const handleUsernameSetupSkip = () => {
    setShowUsernameSetup(false);
    setNeedsUsernameSetup(false);
    addToast("You can set your username later in your profile", "info");
    router.push(`/user/${user?.id}`);
  };

  // Show username setup if needed
  if (user && showUsernameSetup && needsUsernameSetup) {
    return (
      <UsernameSetup
        user={user}
        onComplete={handleUsernameSetupComplete}
        onSkip={handleUsernameSetupSkip}
      />
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 relative overflow-hidden">
        <div className="container mx-auto px-4 py-8 pt-32 max-w-md">
          <div className="card animate-scale-in hover-lift">
            <div className="text-center">
              <div className="text-4xl mb-4 animate-bounce-slow">🎉</div>
              <p className="mb-3 text-neutral">{strings.auth.loggedInMessage}</p>
              <div className="flex gap-3 justify-center">
                <Link href="/" className="btn-secondary">{strings.auth.goHome}</Link>
                <Link href="/ask" className="btn">{strings.auth.askQuestion}</Link>
              </div>
            </div>
          </div>

          {/* Badge Modal */}
          <BadgeModal
            isOpen={!!newBadge}
            onClose={clearNewBadge}
            userPosition={userPosition}
            userName={userName}
          />
        </div>
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

      <div className="container mx-auto px-4 py-8 pt-32 max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="text-6xl mb-4 animate-bounce-slow">🌟</div>
          <h1 className="text-3xl font-extrabold text-primary mb-2">
            {strings.auth.welcome}
          </h1>
          <p className="text-lg text-neutral">
            {strings.auth.welcomeSubtitle}
          </p>
        </div>

        <div className="card uzbek-pattern animate-fade-in-up hover-lift">
          <div className="text-center mb-6">
            <div className="text-3xl mb-3 animate-bounce-slow">🎯</div>
            <h2 className="text-xl font-semibold text-primary">{strings.auth.loginTitle}</h2>
            <p className="text-sm text-neutral mt-2">
              {strings.auth.loginSubtitle}
            </p>
          </div>

          {/* Telegram CTA - prominent */}
          <div className="mb-6">
            <div className="card glass-surface hover-lift animate-fade-in" style={{ padding: '1rem' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">📨</div>
                <div>
                  <div className="text-sm text-warm font-semibold uppercase tracking-wide">{strings.auth.telegram.recommended}</div>
                  <div className="text-lg font-semibold text-primary">{strings.auth.telegram.ctaTitle}</div>
                  <div className="text-sm text-neutral">{strings.auth.telegram.ctaSubtitle}</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {tgBotUsername ? (
                  <a
                    href={`https://t.me/${tgBotUsername}?start=login`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-telegram w-full sm:w-auto text-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13"></path>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                    </svg>
                    {strings.auth.telegram.button}
                  </a>
                ) : (
                  <button type="button" disabled className="btn-telegram w-full sm:w-auto opacity-60 cursor-not-allowed">
                    {strings.auth.telegram.comingSoon}
                  </button>
                )}
                <div className="text-xs text-neutral text-center sm:text-left">{strings.auth.telegram.orContinue}</div>
              </div>
            </div>
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
                  email_label: strings.auth.formLabels.email,
                  password_label: strings.auth.formLabels.password,
                  email_input_placeholder: strings.auth.formLabels.emailPlaceholder,
                  password_input_placeholder: strings.auth.formLabels.passwordPlaceholder,
                  button_label: strings.auth.formLabels.buttonLabel,
                  link_text: strings.auth.formLabels.linkText,
                  loading_button_label: strings.auth.formLabels.loadingButtonLabel,
                  social_provider_text: strings.auth.formLabels.socialProviderText,
                },
                sign_up: {
                  email_label: strings.auth.formLabels.email,
                  password_label: strings.auth.formLabels.password,
                  email_input_placeholder: strings.auth.formLabels.emailPlaceholder,
                  password_input_placeholder: strings.auth.formLabels.passwordCreatePlaceholder,
                  button_label: strings.auth.formLabels.signupButtonLabel,
                  loading_button_label: strings.auth.formLabels.signupLoadingButtonLabel,
                  social_provider_text: strings.auth.formLabels.signupSocialProviderText,
                  link_text: strings.auth.formLabels.signupLinkText
                },
                forgotten_password: {
                  email_label: strings.auth.formLabels.email,
                  email_input_placeholder: strings.auth.formLabels.emailPlaceholder,
                  button_label: strings.auth.formLabels.forgotPasswordButton,
                  link_text: strings.auth.formLabels.forgotPasswordLink,
                  loading_button_label: strings.auth.formLabels.forgotPasswordLoading
                },
                magic_link: {
                  email_input_label: strings.auth.formLabels.email,
                  email_input_placeholder: strings.auth.formLabels.emailPlaceholder,
                  button_label: strings.auth.formLabels.magicLinkButton,
                  loading_button_label: strings.auth.formLabels.magicLinkLoading,
                  link_text: strings.auth.formLabels.magicLinkText
                },
                update_password: {
                  password_label: strings.auth.formLabels.updatePasswordLabel,
                  password_input_placeholder: strings.auth.formLabels.updatePasswordPlaceholder,
                  button_label: strings.auth.formLabels.updatePasswordButton,
                  loading_button_label: strings.auth.formLabels.updatePasswordLoading
                },
                verify_otp: {
                  email_input_label: strings.auth.formLabels.email,
                  email_input_placeholder: strings.auth.formLabels.emailPlaceholder,
                  button_label: strings.auth.formLabels.verifyOtpButton,
                  loading_button_label: strings.auth.formLabels.verifyOtpLoading
                },
              }
            }}
          />
        </div>

        {/* Fun tip */}
        <div className="text-center mt-6 animate-fade-in-up" style={{animationDelay: '600ms'}}>
          <div className="text-2xl mb-2 animate-bounce-slow">💡</div>
          <p className="text-sm text-accent">
            {strings.auth.tip}
          </p>
        </div>
      </div>

      {/* Badge Modal */}
      <BadgeModal
        isOpen={!!newBadge}
        onClose={clearNewBadge}
        userPosition={userPosition}
        userName={userName}
      />
    </div>
  );
}
