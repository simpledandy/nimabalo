/**
 * Utility functions for username generation and validation
 */

/**
 * Generate a suggested username based on email and name
 */
export function generateSuggestedUsername(email?: string, fullName?: string): string {
  let base = '';
  
  // If we have a full name, use it as the primary base
  if (fullName && fullName.trim()) {
    base = fullName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '') // Remove spaces
      .substring(0, 15); // Limit length
  }
  
  // If no name or empty, use email prefix
  if (!base && email) {
    base = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .substring(0, 15);
  }
  
  // If still no base, generate a random one
  if (!base) {
    base = 'user' + Math.floor(Math.random() * 10000);
  }
  
  // Ensure it's not too short
  if (base.length < 3) {
    base = base + Math.floor(Math.random() * 100);
  }
  
  return base;
}

/**
 * Validate username format
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less' };
  }
  
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain lowercase letters, numbers, and underscores' };
  }
  
  if (username.startsWith('_') || username.endsWith('_')) {
    return { valid: false, error: 'Username cannot start or end with underscore' };
  }
  
  if (username.includes('__')) {
    return { valid: false, error: 'Username cannot contain consecutive underscores' };
  }
  
  return { valid: true };
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string, supabase: any): Promise<{ available: boolean; error?: string }> {
  const validation = validateUsername(username);
  if (!validation.valid) {
    return { available: false, error: validation.error };
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      return { available: false, error: 'Error checking username availability' };
    }
    
    // If we got data, username is taken
    if (data) {
      return { available: false, error: 'This username is already taken' };
    }
    
    return { available: true };
  } catch (err) {
    return { available: false, error: 'Error checking username availability' };
  }
}

/**
 * Generate alternative username suggestions
 */
export function generateAlternatives(baseUsername: string): string[] {
  const alternatives: string[] = [];
  const base = baseUsername.toLowerCase();
  
  // Add numbers
  for (let i = 1; i <= 99; i++) {
    alternatives.push(`${base}${i}`);
    if (alternatives.length >= 5) break;
  }
  
  // Add underscores with numbers
  for (let i = 1; i <= 20; i++) {
    alternatives.push(`${base}_${i}`);
    if (alternatives.length >= 10) break;
  }
  
  return alternatives.slice(0, 8); // Return up to 8 alternatives
}
