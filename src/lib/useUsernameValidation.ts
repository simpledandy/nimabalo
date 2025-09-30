import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { validateUsername, isUsernameAvailable, generateAlternatives } from './usernameUtils';

interface UsernameValidationState {
  isValidating: boolean;
  error: string | null;
  isAvailable: boolean | null;
  alternatives: string[];
}

export function useUsernameValidation(username: string, currentUsername?: string) {
  const [state, setState] = useState<UsernameValidationState>({
    isValidating: false,
    error: null,
    isAvailable: null,
    alternatives: []
  });

  useEffect(() => {
    if (!username || username === currentUsername) {
      setState({
        isValidating: false,
        error: null,
        isAvailable: true,
        alternatives: []
      });
      return;
    }

    const validation = validateUsername(username);
    if (!validation.valid) {
      setState({
        isValidating: false,
        error: validation.error || null,
        isAvailable: false,
        alternatives: generateAlternatives(username).slice(0, 6)
      });
      return;
    }

    setState(prev => ({ ...prev, isValidating: true, error: null }));
    
    const timeoutId = setTimeout(async () => {
      const result = await isUsernameAvailable(username, supabase);
      setState({
        isValidating: false,
        error: result.error || null,
        isAvailable: result.available,
        alternatives: result.available ? [] : generateAlternatives(username).slice(0, 6)
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, currentUsername]);

  return state;
}
