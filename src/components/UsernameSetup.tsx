"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { generateSuggestedUsername } from '@/lib/usernameUtils';
import { strings } from '@/lib/strings';
import UsernameInput from './UsernameInput';
import AvatarPicker from './AvatarPicker';

interface UsernameSetupProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      telegram_username?: string;
    };
  };
  onComplete: (username: string) => void;
  onSkip?: () => void;
}

export default function UsernameSetup({ user, onComplete, onSkip }: UsernameSetupProps) {
  const [step, setStep] = useState(1); // 1: basic info, 2: avatar
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Generate initial suggestion when component mounts
  useEffect(() => {
    if (user?.email) {
      const suggested = generateSuggestedUsername(
        user.email, 
        user.user_metadata?.full_name,
        user.user_metadata?.telegram_username
      );
      setUsername(suggested);
    }
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleContinue = () => {
    if (username && isValid && fullName.trim()) {
      setStep(2);
    }
  };

  const handleSave = async () => {
    if (!username || !isValid || !fullName.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.toLowerCase(),
          full_name: fullName.trim(),
          avatar_url: avatarUrl || null,
        });

      if (error) {
        console.error('Error saving profile:', error);
        return;
      }

      onComplete(username);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in-up">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            step >= 1 ? 'bg-accent text-white scale-110' : 'bg-gray-200 text-gray-400'
          }`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <div className={`w-12 h-1 rounded transition-all ${step >= 2 ? 'bg-accent' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            step >= 2 ? 'bg-accent text-white scale-110' : 'bg-gray-200 text-gray-400'
          }`}>
            2
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="text-6xl mb-4 animate-bounce-slow">
            {step === 1 ? '🎯' : '🎨'}
          </div>
          <h1 className="text-3xl font-extrabold text-primary mb-2">
            {step === 1 ? 'Create Your Profile' : 'Choose Your Avatar'}
          </h1>
          <p className="text-lg text-neutral">
            {step === 1 ? (
              <>
                Your unique identity on <span className="font-mono text-accent">nimabalo.uz</span>
              </>
            ) : (
              'Pick a style that represents you!'
            )}
          </p>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="card space-y-6 animate-scale-in hover-lift">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <h2 className="text-xl font-bold text-primary">Basic Information</h2>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="input w-full"
                maxLength={100}
              />
              <p className="text-xs text-neutral mt-1">
                This will be displayed on your profile
              </p>
            </div>
            
            {/* Username */}
            <UsernameInput
              value={username}
              onChange={(value, valid) => {
                setUsername(value);
                setIsValid(valid || null);
              }}
              placeholder={strings.profile.usernameSetup.usernamePlaceholder}
              userEmail={user?.email}
              userFullName={fullName || user?.user_metadata?.full_name}
              telegramUsername={user?.user_metadata?.telegram_username}
              showSuggestions={true}
            />

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleContinue}
                disabled={!username || !isValid || !fullName.trim()}
                className="btn w-full text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>Continue</span>
                  <span>→</span>
                </span>
              </button>
              
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="text-neutral hover:text-primary transition-colors text-sm w-full"
                >
                  {strings.profile.usernameSetup.skipForNow}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Avatar Selection */}
        {step === 2 && (
          <div className="card space-y-6 animate-scale-in hover-lift">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎨</span>
              <h2 className="text-xl font-bold text-primary">Your Avatar</h2>
            </div>

            <AvatarPicker
              seed={username || user?.email || 'default'}
              value={avatarUrl}
              onChange={setAvatarUrl}
            />

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={isSaving}
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
              
              <button
                onClick={() => setStep(1)}
                disabled={isSaving}
                className="btn-secondary w-full text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>←</span>
                  <span>Back</span>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Fun tip */}
        <div className="text-center mt-6 animate-fade-in-up" style={{animationDelay: '600ms'}}>
          <div className="text-2xl mb-2 animate-bounce-slow">💡</div>
          <p className="text-sm text-accent">
            {step === 1 
              ? strings.profile.usernameSetup.tip
              : 'Your avatar is generated uniquely for you - no uploads needed!'
            }
          </p>
        </div>
      </div>
    </div>
  );
}