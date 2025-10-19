import { customAlphabet } from 'nanoid';
import { minutesFromNow } from './utils';
import { getPool } from './db';

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

  const pool = getPool();
  await pool.query(
    `insert into tg_login_tokens (token, telegram_id, telegram_username, first_name, last_name, expires_at)
     values ($1, $2, $3, $4, $5, $6)`,
    [userData.token, userData.telegramId, userData.username, userData.firstName, userData.lastName, userData.expiresAt]
  );

  return { token, userData };
};

export const makeAuthUrl = (token: string, siteUrl?: string) => {
  const base = siteUrl || process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${base}/api/tg-auth?tg_token=${encodeURIComponent(token)}`;
};
