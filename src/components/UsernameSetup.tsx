"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { generateSuggestedUsername } from '@/lib/usernameUtils';
import { strings } from '@/lib/strings';
import UsernameInput from './UsernameInput';

interface UsernameSetupProps {
  user: any;
  onComplete: (username: string) => void;
  onSkip?: () => void;
}

export default function UsernameSetup({ user, onComplete, onSkip }: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const [suggestedUsername, setSuggestedUsername] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Generate initial suggestion when component mounts
  useEffect(() => {
    if (user?.email) {
      const suggested = generateSuggestedUsername(user.email, user.user_metadata?.full_name);
      setSuggestedUsername(suggested);
      setUsername(suggested);
    }
  }, [user]);

  const handleSave = async () => {
    if (!username || !isValid) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.toLowerCase(),
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        });

      if (error) {
        console.error('Error saving username:', error);
        return;
      }

      onComplete(username);
    } catch (err) {
      console.error('Error saving username:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectAlternative = (altUsername: string) => {
    setUsername(altUsername);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="text-6xl mb-4 animate-bounce-slow">🎯</div>
          <h1 className="text-3xl font-extrabold text-primary mb-2">
            {strings.profile.usernameSetup.title}
          </h1>
          <p className="text-lg text-neutral">
            {strings.profile.usernameSetup.subtitle}: <br />
            <span className="font-mono text-accent">nimabalo.uz/yourusername</span>
          </p>
        </div>

        {/* Username Input Card */}
        <div className="card space-y-6 animate-fade-in-up hover-lift" style={{animationDelay: '200ms'}}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <h2 className="text-xl font-bold text-primary">{strings.profile.usernameSetup.pickUsername}</h2>
          </div>
          
          <UsernameInput
            value={username}
            onChange={(value, valid) => {
              setUsername(value);
              setIsValid(valid || null);
            }}
            placeholder={strings.profile.usernameSetup.usernamePlaceholder}
            userEmail={user?.email}
            userFullName={user?.user_metadata?.full_name}
            showSuggestions={true}
          />


          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleSave}
              disabled={!username || !isValid || isSaving}
              className="btn w-full text-center"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {strings.profile.usernameSetup.saving}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  {strings.profile.usernameSetup.createProfile}
                </span>
              )}
            </button>
            
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-neutral hover:text-primary transition-colors text-sm"
              >
                {strings.profile.usernameSetup.skipForNow}
              </button>
            )}
          </div>
        </div>

        {/* Fun tip */}
        <div className="text-center mt-6 animate-fade-in-up" style={{animationDelay: '600ms'}}>
          <div className="text-2xl mb-2 animate-bounce-slow">💡</div>
          <p className="text-sm text-accent">
            {strings.profile.usernameSetup.tip}
          </p>
        </div>
      </div>
    </div>
  );
}
