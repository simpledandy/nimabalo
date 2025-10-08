'use client';

import { useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

/**
 * Custom React hook to get the current Supabase user and session.
 * @returns {{ user: User | null; session: Session | null; loading: boolean }}
 */
export function useSession(): { user: User | null; session: Session | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to create user profile - using useCallback to avoid stale closures
  const handleNewUser = useCallback(async (user: User) => {
    try {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          username: user.user_metadata?.username || user.user_metadata?.preferred_username || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't throw - profile creation will be retried on next sign-in
        return false;
      }

      console.log('✅ Profile created successfully for user:', user.id);
      return true;
    } catch (error) {
      console.error('Error handling new user:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let sessionCheckAttempts = 0;
    const maxAttempts = 3;

    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Try to recover session from storage
          if (sessionCheckAttempts < maxAttempts) {
            sessionCheckAttempts++;
            setTimeout(() => initSession(), 1000);
            return;
          }
        }

        if (!mounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        if (!mounted) return;
        setLoading(false);
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Handle new user signup
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Check if this is a new user by checking if profile exists
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle(); // Use maybeSingle instead of single to avoid error when not found
          
          if (profileCheckError) {
            console.error('Error checking for existing profile:', profileCheckError);
          }
          
          if (!existingProfile) {
            console.log('New user detected, creating profile...');
            await handleNewUser(session.user);
          }
        } catch (error) {
          console.error('Error in sign-in handler:', error);
        }
      }

      // Handle session refresh
      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Session token refreshed successfully');
      }

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleNewUser]);

  return { user, session, loading };
}
