import { customAlphabet } from 'nanoid';
import { minutesFromNow } from './utils';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const nano = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 36);
export const makeToken = () => nano();

export const createLoginToken = async (tgUser: any) => {
  const token = makeToken();
  const expiresAt = minutesFromNow(10);
  const userData = {
    token,
    telegramId: tgUser.id,
    username: tgUser.username || null,
    firstName: tgUser.first_name || null,
    lastName: tgUser.last_name || null,
    expiresAt,
  };

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from('tg_login_tokens')
    .insert({
      token: userData.token,
      telegram_id: userData.telegramId,
      telegram_username: userData.username,
      first_name: userData.firstName,
      last_name: userData.lastName,
      expires_at: userData.expiresAt
    });

  if (error) throw error;
  return { token, userData };
};

export const makeAuthUrl = (token: string, siteUrl?: string) => {
  const base = siteUrl || process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${base}/api/tg-auth?tg_token=${encodeURIComponent(token)}`;
};
