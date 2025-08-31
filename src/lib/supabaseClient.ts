'use client';

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client instance for interacting with the Supabase backend.
 * Uses environment variables for configuration.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
