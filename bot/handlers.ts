import TelegramBot from 'node-telegram-bot-api';
import { Pool } from 'pg';
import { BotError } from './types';
import { ensureSchema, getPool } from './db';
import { makeToken, createLoginToken, makeAuthUrl } from './client';
import { ErrorHandler } from './errorHandler';

export const setupHandlers = (bot: TelegramBot, pool: Pool, adminTelegramId?: string | number) => {
  bot.onText(/\/start(?:\s+(.*))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const tgUser = msg.from;

    try {
      await ErrorHandler.handleWithRetry(async () => {
        await ensureSchema();
        const { rows: existingTokens } = await pool.query(
          `select count(*) as login_count from tg_login_tokens where telegram_id = $1 and consumed_at is not null`,
          [tgUser.id]
        );
        const isExistingUser = parseInt(existingTokens[0]?.login_count || 0) > 0;
        const { token, userData } = await createLoginToken(tgUser);
        const url = makeAuthUrl(token);

        const userName = userData.firstName || 'do\'st';
        const hasUsername = userData.username ? ` (@${userData.username})` : '';
        const suggestedUsername = userData.username ? userData.username : `tg_${userData.telegramId}`;

        let welcome;
        if (isExistingUser) {
          welcome = `Xush kelibsiz, ${userName}${hasUsername}!\n\n` +
            `🎯 Nimabalo'ga qaytganingizdan xursandmiz!\n` +
            `📊 Sizning statistikangiz: ${existingTokens[0].login_count} marta kirish\n\n` +
            `🔗 Yangi kirish havolasi tayyor:`;
        } else {
          welcome = `Assalomu alaykum, ${userName}${hasUsername}!\n\n` +
            `🎯 Nimabalo - bu savollar va javoblar platformasi\n` +
            `💡 Sizning taklif qilinayotgan username: @${suggestedUsername}\n\n` +
            `Bir martalik havola orqali saytda tez kirish mumkin:`;
        }

        await bot.sendMessage(chatId, welcome, {
          reply_markup: {
            inline_keyboard: [[{ text: '✅ Nimabaloga kirish', url }]],
          },
          disable_web_page_preview: true,
        });

        setTimeout(async () => {
          await setupControlKeyboard(bot, chatId);
        }, 2000);
      }, 3, 'Start command');
    } catch (err) {
      console.error('Start handler error:', err);
      const userMessage = (err as BotError).userMessage || 'Kutilmagan xatolik. Iltimos, qayta urining.';
      await bot.sendMessage(chatId, userMessage);
    }
  });

  // Additional handlers can be added here (link, congrats, callbacks, messages)
};

// Helper to set up persistent keyboard
async function setupControlKeyboard(bot: TelegramBot, chatId: number) {
  const controlKeyboard = {
    reply_markup: {
      keyboard: [
        [{ text: '🏠 Bosh sahifa' }, { text: '💬 Fikr bildirish' }],
        [{ text: '🔗 Kirish havolasi' }, { text: '📊 Statistika' }],
        [{ text: '❓ Yordam' }, { text: '⭐ Baholash' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
  await bot.sendMessage(chatId, '🎛️ Boshqaruv tugmalari faollashtirildi!', controlKeyboard);
}
