import TelegramBot from 'node-telegram-bot-api';
import { initDb } from './db';
import { setupHandlers } from './handlers';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const DATABASE_URL = process.env.DATABASE_URL as string;

if (!BOT_TOKEN) {
  console.error('Missing TELEGRAM_BOT_TOKEN');
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const pool = initDb(DATABASE_URL);
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
setupHandlers(bot, pool, process.env.ADMIN_TELEGRAM_ID);

console.log('Running bot in polling mode for local development');
