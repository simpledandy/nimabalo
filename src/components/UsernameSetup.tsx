"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { generateSuggestedUsername, validateUsername, isUsernameAvailable, generateAlternatives } from '@/lib/usernameUtils';
import { strings } from '@/lib/strings';

interface UsernameSetupProps {
  user: any;
  onComplete: (username: string) => void;
  onSkip?: () => void;
}

export default function UsernameSetup({ user, onComplete, onSkip }: UsernameSetupProps) {
  const [username, setUsername] = useState('');
  const [suggestedUsername, setSuggestedUsername] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Generate initial suggestion when component mounts
  useEffect(() => {
    if (user?.email) {
      const suggested = generateSuggestedUsername(user.email, user.user_metadata?.full_name);
      setSuggestedUsername(suggested);
      setUsername(suggested);
      setAlternatives(generateAlternatives(suggested));
    }
  }, [user]);

  // Validate username as user types
  useEffect(() => {
    if (!username) {
      setValidationError(null);
      setIsAvailable(null);
      return;
    }

    const validation = validateUsername(username);
    if (!validation.valid) {
      setValidationError(validation.error || null);
      setIsAvailable(false);
      return;
    }

    setValidationError(null);
    
    // Check availability with debounce
    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      const result = await isUsernameAvailable(username, supabase);
      setIsAvailable(result.available);
      if (!result.available && result.error) {
        setValidationError(result.error);
      }
      setIsValidating(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSave = async () => {
    if (!username || !isAvailable) return;

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
        setValidationError('Error saving username. Please try again.');
        return;
      }

      onComplete(username);
    } catch (err) {
      setValidationError('Error saving username. Please try again.');
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
          
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-primary mb-2 block">{strings.profile.usernameSetup.usernameLabel}</span>
              <div className="relative">
                <input
                  className="input pr-12"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder={strings.profile.usernameSetup.usernamePlaceholder}
                  maxLength={20}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {isValidating && (
                    <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full"></div>
                  )}
                  {!isValidating && isAvailable === true && (
                    <span className="text-success text-lg">✓</span>
                  )}
                  {!isValidating && isAvailable === false && (
                    <span className="text-error text-lg">✗</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-neutral mt-1">
                {strings.profile.usernameSetup.usernameRules}
              </div>
            </label>

            {/* Validation Messages */}
            {validationError && (
              <div className="text-error text-sm bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
                <span>⚠️</span>
                {validationError}
              </div>
            )}

            {isAvailable === true && (
              <div className="text-success text-sm bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
                <span>🎉</span>
                {strings.profile.usernameSetup.available}
              </div>
            )}
          </div>

          {/* Alternative Suggestions */}
          {alternatives.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-primary">{strings.profile.usernameSetup.suggestionsTitle}</h3>
              <div className="flex flex-wrap gap-2">
                {alternatives.slice(0, 6).map((alt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAlternative(alt)}
                    className="px-3 py-1 text-sm bg-light hover:bg-secondary hover:text-white rounded-full transition-colors border border-gray-200"
                  >
                    {alt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleSave}
              disabled={!username || !isAvailable || isSaving}
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
