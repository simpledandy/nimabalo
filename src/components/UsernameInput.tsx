"use client";

import { useState, useEffect } from 'react';
import { generateSuggestedUsername } from '@/lib/usernameUtils';
import { useUsernameValidation } from '@/lib/useUsernameValidation';
import { strings } from '@/lib/strings';

interface UsernameInputProps {
  value: string;
  onChange: (value: string, isValid?: boolean | null) => void;
  currentUsername?: string;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  userEmail?: string;
  userFullName?: string;
  telegramUsername?: string;
}

export default function UsernameInput({
  value,
  onChange,
  currentUsername,
  placeholder = strings.profile.editProfilePage.fields.usernamePlaceholder,
  className = "",
  showSuggestions = true,
  userEmail,
  userFullName,
  telegramUsername
}: UsernameInputProps) {
  const [suggestedUsername, setSuggestedUsername] = useState('');
  const validation = useUsernameValidation(value, currentUsername);

  // Generate initial suggestion when component mounts or user data changes
  useEffect(() => {
    if (userEmail && !value && !currentUsername) {
      const suggested = generateSuggestedUsername(userEmail, userFullName, telegramUsername);
      setSuggestedUsername(suggested);
      onChange(suggested);
    }
  }, [userEmail, userFullName, telegramUsername, value, currentUsername, onChange]);

  const handleSelectAlternative = (altUsername: string) => {
    onChange(altUsername, validation.isAvailable);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        {strings.profile.editProfilePage.fields.username}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase(), validation.isAvailable)}
          placeholder={placeholder}
          className={`input w-full pr-12 ${className}`}
          maxLength={20}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {validation.isValidating && (
            <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full"></div>
          )}
          {!validation.isValidating && validation.isAvailable === true && (
            <span className="text-success text-lg">✓</span>
          )}
          {!validation.isValidating && validation.isAvailable === false && (
            <span className="text-error text-lg">✗</span>
          )}
        </div>
      </div>
      
      {validation.error && (
        <p className="text-error text-sm mt-1">{validation.error}</p>
      )}
      
      {validation.isAvailable === true && value && (
        <p className="text-success text-sm mt-1">✅ {strings.profile.usernameSetup.available}</p>
      )}

      {/* Username alternatives */}
      {showSuggestions && validation.alternatives.length > 0 && value && (
        <div className="mt-3">
          <p className="text-sm text-neutral mb-2">{strings.profile.usernameSetup.suggestionsTitle}</p>
          <div className="flex flex-wrap gap-2">
            {validation.alternatives.map((alt, index) => (
              <button
                key={index}
                onClick={() => handleSelectAlternative(alt)}
                className="px-3 py-1 text-sm bg-light hover:bg-accent hover:text-white rounded-full transition-colors border border-gray-200"
              >
                {alt}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-xs text-neutral mt-1">{strings.profile.usernameSetup.usernameRules}</p>
    </div>
  );
}