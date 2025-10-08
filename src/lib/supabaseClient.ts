'use client';

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client instance for interacting with the Supabase backend.
 * Uses environment variables for configuration and handles different environments.
 */

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const error = `Missing Supabase environment variables:
  - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌ MISSING'}
  - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅' : '❌ MISSING'}
  
  Please check your .env.local file or environment configuration.`;
  
  console.error(error);
  throw new Error(error);
}

// Debug: Check if env vars are loaded
if (typeof window !== 'undefined') {
  console.log('🔍 Supabase Client Debug:', {
    url: '✅ SET',
    key: '✅ SET',
    urlValue: supabaseUrl.substring(0, 30) + '...'
  });
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // Enable automatic session detection from URL
      detectSessionInUrl: true,
      // Persist session in local storage
      persistSession: true,
      // Auto-refresh tokens before they expire
      autoRefreshToken: true,
      // Storage key for session
      storageKey: 'nimabalo-auth',
      // Flow type for auth
      flowType: 'pkce'
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'nimabalo'
      }
    }
  }
);
