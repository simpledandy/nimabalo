import { supabase } from './supabaseClient';

// Utility function to add timeout to Supabase queries
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    )
  ]);
}

// Wrapper for Supabase queries with timeout
export async function queryWithTimeout<T>(
  query: any, // Supabase query builder
  timeoutMs: number = 10000
): Promise<T> {
  return withTimeout(query, timeoutMs);
}

// Helper to handle Supabase errors gracefully
export function handleSupabaseError(error: any, context: string = 'Supabase query') {
  console.error(`${context} error:`, error);
  
  if (error.message?.includes('timeout')) {
    return 'Network timeout - please try again';
  }
  
  if (error.message?.includes('fetch')) {
    return 'Network error - please check your connection';
  }
  
  return error.message || 'An unexpected error occurred';
}
