'use client';

import { useEffect, useState } from 'react';
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

  // Function to create user profile and award nth_user badge
  const handleNewUser = async (user: User) => {
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
        return;
      }

      // Note: Badge awarding is now handled by useBadges hook
    } catch (error) {
      console.error('Error handling new user:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Handle new user signup
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if this is a new user by checking if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();
        
        if (!existingProfile) {
          await handleNewUser(session.user);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading };
}
