import { getPool } from './db';
import { TelegramClient } from './telegramClient';
import { makeAuthUrl, createLoginToken } from './client';
import { processError } from './utils';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
if (!BOT_TOKEN) throw new Error('Missing TELEGRAM_BOT_TOKEN');
const telegram = new TelegramClient(BOT_TOKEN);

export async function handleUpdate(update: any) {
  try {
    // Handle message updates
    if (update.message && update.message.text) {
      const text = update.message.text;
      const chatId = update.message.chat.id;
      const from = update.message.from;

      if (text.startsWith('/start')) {
        const { token } = await createLoginToken(from);
        const url = makeAuthUrl(token);
        await telegram.sendMessage(chatId, `Salom! Kirish uchun havola: ${url}`);
      } else if (text === '🔗 Kirish havolasi') {
        const { token } = await createLoginToken(from);
        const url = makeAuthUrl(token);
        await telegram.sendMessage(chatId, `🔗 Yangi kirish havolasi: ${url}`);
      } else {
        await telegram.sendMessage(chatId, 'Xabar qabul qilindi, rahmat!');
      }
    }
  } catch (err) {
    console.error('handleUpdate error', err);
    const e = processError(err);
    // Try to notify admin if configured
    if (process.env.ADMIN_TELEGRAM_ID) {
      try {
        await telegram.sendMessage(process.env.ADMIN_TELEGRAM_ID, `Bot error: ${e.message}`);
      } catch (e) {
        // ignore
      }
    }
  }
}
