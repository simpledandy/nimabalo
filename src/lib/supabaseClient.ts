'use client';

import { createClient } from '@supabase/supabase-js';

/**
 * Get the appropriate site URL based on the environment
 */
function getSiteUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side rendering
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }
  
  // Use the NEXT_PUBLIC_SITE_URL which is now properly configured in next.config.mjs
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://nimabalo.uz';
}

/**
 * Supabase client instance for interacting with the Supabase backend.
 * Uses environment variables for configuration and handles different environments.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      detectSessionInUrl: true
    }
  }
);
