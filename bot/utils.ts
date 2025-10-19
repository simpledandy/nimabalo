import { BotError } from './types';

export const minutesFromNow = (m: number) => new Date(Date.now() + m * 60 * 1000);

export const getSiteUrl = () => {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) return 'https://nimabalo.uz';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

export const processError = (error: any) => {
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return new BotError('Network error occurred', 'NETWORK_ERROR', true, "Internet aloqasi bilan muammo. Iltimos, qayta urining.");
  }
  if (error.message?.includes('timeout')) {
    return new BotError('Request timeout', 'NETWORK_ERROR', true, "So'rov vaqti tugadi. Iltimos, qayta urining.");
  }
  if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
    return new BotError('Rate limited', 'RATE_LIMIT_ERROR', true, "Juda ko'p so'rov yuborildi. Kuting.");
  }
  if (error.message?.includes('database') || error.message?.includes('connection')) {
    return new BotError('Database error', 'DATABASE_ERROR', true, "Ma'lumotlar bazasi bilan muammo.");
  }
  return new BotError(error.message || 'Unknown error', 'UNKNOWN_ERROR', false, "Kutilmagan xatolik yuz berdi.");
};

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
