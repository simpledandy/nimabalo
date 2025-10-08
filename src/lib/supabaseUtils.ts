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
  query: Promise<T>, // Supabase query builder result
  timeoutMs: number = 10000
): Promise<T> {
  return withTimeout(query, timeoutMs);
}

// Helper to handle Supabase errors gracefully
export function handleSupabaseError(error: unknown, context: string = 'Supabase query') {
  console.error(`${context} error:`, error);
  
  const err = error as Error;
  
  if (err.message?.includes('timeout')) {
    return 'Network timeout - please try again';
  }
  
  if (err.message?.includes('fetch')) {
    return 'Network error - please check your connection';
  }
  
  return err.message || 'An unexpected error occurred';
}
