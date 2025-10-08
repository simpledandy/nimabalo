/**
 * Utility functions for username generation and validation
 */

/**
 * Generate a suggested username based on email, name, and Telegram username
 */
export function generateSuggestedUsername(email?: string, fullName?: string, telegramUsername?: string): string {
  let base = '';
  
  // Priority 1: Use Telegram username if available
  if (telegramUsername && telegramUsername.trim()) {
    base = telegramUsername
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '') // Remove special characters except underscores
      .substring(0, 20); // Limit length
  }
  
  // Priority 2: If we have a full name, use it as the base
  if (!base && fullName && fullName.trim()) {
    base = fullName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '') // Remove spaces
      .substring(0, 15); // Limit length
  }
  
  // Priority 3: If no name or empty, use email prefix
  if (!base && email) {
    base = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .substring(0, 15);
  }
  
  // Priority 4: If still no base, generate a random one
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
    return { valid: false, error: 'Username kamida 3 ta belgidan iborat bo\'lishi kerak' };
  }
  
  if (username.length > 20) {
    return { valid: false, error: 'Username 20 ta belgidan ko\'p bo\'lmasligi kerak' };
  }
  
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username faqat kichik harflar, raqamlar va pastki chiziqdan iborat bo\'lishi mumkin' };
  }
  
  if (username.startsWith('_') || username.endsWith('_')) {
    return { valid: false, error: 'Username pastki chiziq bilan boshlanmasligi yoki tugamasligi kerak' };
  }
  
  if (username.includes('__')) {
    return { valid: false, error: 'Username ketma-ket pastki chiziqlardan iborat bo\'lmasligi kerak' };
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
      return { available: false, error: 'Username mavjudligini tekshirishda xatolik' };
    }
    
    // If we got data, username is taken
    if (data) {
      return { available: false, error: 'Bu username allaqachon ishlatilgan' };
    }
    
    return { available: true };
  } catch {
    return { available: false, error: 'Username mavjudligini tekshirishda xatolik' };
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
