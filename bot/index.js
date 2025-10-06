'use strict';

// Enhanced Telegram bot with robust error handling and feedback system
// Env required:
// - TELEGRAM_BOT_TOKEN
// - DATABASE_URL (Render Postgres)
// - SITE_URL (e.g. https://nimabalo.uz or http://localhost:3000)
// - ADMIN_TELEGRAM_ID (for feedback notifications)

const TelegramBot = require('node-telegram-bot-api');
const { Pool } = require('pg');
const { customAlphabet } = require('nanoid');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;
const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID; // For feedback notifications

// Enhanced error handling
class BotError extends Error {
  constructor(message, type = 'UNKNOWN', retryable = false, userMessage = null) {
    super(message);
    this.name = 'BotError';
    this.type = type;
    this.retryable = retryable;
    this.userMessage = userMessage || message;
  }
}

// Error types
const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  DATABASE: 'DATABASE_ERROR',
  BOT_API: 'BOT_API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error handler with retry logic
class ErrorHandler {
  static async handleWithRetry(operation, maxRetries = 3, context = '') {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.error(`[Attempt ${attempt}/${maxRetries}] ${context} error:`, error.message);
        
        if (attempt === maxRetries || !this.isRetryable(error)) {
          break;
        }
        
        // Wait before retry
        const delay = this.getRetryDelay(error, attempt);
        await this.delay(delay);
      }
    }
    
    throw this.processError(lastError);
  }
  
  static isRetryable(error) {
    const retryableTypes = [ERROR_TYPES.NETWORK, ERROR_TYPES.DATABASE, ERROR_TYPES.RATE_LIMIT];
    return retryableTypes.includes(error.type) || 
           error.message?.includes('timeout') ||
           error.message?.includes('connection');
  }
  
  static getRetryDelay(error, attempt) {
    if (error.type === ERROR_TYPES.RATE_LIMIT) {
      return Math.min(1000 * Math.pow(2, attempt), 60000); // Exponential backoff, max 1 minute
    }
    return Math.min(1000 * attempt, 5000); // Linear backoff, max 5 seconds
  }
  
  static processError(error) {
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return new BotError('Network error occurred', ERROR_TYPES.NETWORK, true, 'Internet aloqasi bilan muammo. Iltimos, qayta urining.');
    }
    if (error.message?.includes('timeout')) {
      return new BotError('Request timeout', ERROR_TYPES.NETWORK, true, 'So\'rov vaqti tugadi. Iltimos, qayta urining.');
    }
    if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
      return new BotError('Rate limited', ERROR_TYPES.RATE_LIMIT, true, 'Juda ko\'p so\'rov yuborildi. Kuting.');
    }
    if (error.message?.includes('database') || error.message?.includes('connection')) {
      return new BotError('Database error', ERROR_TYPES.DATABASE, true, 'Ma\'lumotlar bazasi bilan muammo.');
    }
    
    return new BotError(error.message || 'Unknown error', ERROR_TYPES.UNKNOWN, false, 'Kutilmagan xatolik yuz berdi.');
  }
  
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

if (!BOT_TOKEN) {
  console.error('❌ Missing TELEGRAM_BOT_TOKEN');
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL');
  process.exit(1);
}

// DB setup
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Create tables if not exists
const ensureSchema = async () => {
  await pool.query(`
    create table if not exists tg_login_tokens (
      id bigserial primary key,
      token text unique not null,
      telegram_id bigint not null,
      telegram_username text,
      first_name text,
      last_name text,
      created_at timestamptz not null default now(),
      expires_at timestamptz not null,
      consumed_at timestamptz
    );
    create index if not exists idx_tg_login_tokens_token on tg_login_tokens(token);
    create index if not exists idx_tg_login_tokens_expires on tg_login_tokens(expires_at);
    
    create table if not exists tg_user_feedback (
      id bigserial primary key,
      telegram_id bigint not null,
      question_type text not null,
      answer text not null,
      created_at timestamptz not null default now()
    );
    create index if not exists idx_tg_user_feedback_telegram_id on tg_user_feedback(telegram_id);
    
    create table if not exists tg_feedback_messages (
      id bigserial primary key,
      telegram_id bigint not null,
      message_text text not null,
      message_type text not null default 'feedback',
      forwarded_to_admin boolean not null default false,
      admin_message_id bigint,
      created_at timestamptz not null default now()
    );
    create index if not exists idx_tg_feedback_messages_telegram_id on tg_feedback_messages(telegram_id);
    create index if not exists idx_tg_feedback_messages_forwarded on tg_feedback_messages(forwarded_to_admin);
  `);
};

const nano = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 36);
const makeToken = () => nano();

// Bot init (long polling for simplicity)
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Feedback forwarding to admin
const forwardFeedbackToAdmin = async (tgUser, messageText, messageType = 'feedback') => {
  if (!ADMIN_TELEGRAM_ID) {
    console.warn('⚠️ ADMIN_TELEGRAM_ID not set, feedback will not be forwarded');
    return null;
  }

  try {
    const adminMessage = `📝 Yangi fikr-mulohaza:\n\n` +
      `👤 Foydalanuvchi: ${tgUser.first_name || 'Noma\'lum'} ${tgUser.last_name || ''}\n` +
      `🆔 ID: ${tgUser.id}\n` +
      `📧 Username: @${tgUser.username || 'yo\'q'}\n` +
      `📅 Vaqt: ${new Date().toLocaleString('uz-UZ')}\n\n` +
      `💬 Xabar:\n${messageText}`;

    const sentMessage = await ErrorHandler.handleWithRetry(
      () => bot.sendMessage(ADMIN_TELEGRAM_ID, adminMessage),
      3,
      'Forward feedback to admin'
    );

    // Store feedback in database
    await pool.query(
      `insert into tg_feedback_messages (telegram_id, message_text, message_type, forwarded_to_admin, admin_message_id) 
       values ($1, $2, $3, true, $4)`,
      [tgUser.id, messageText, messageType, sentMessage.message_id]
    );

    return sentMessage.message_id;
  } catch (error) {
    console.error('Failed to forward feedback to admin:', error);
    
    // Store feedback even if forwarding failed
    await pool.query(
      `insert into tg_feedback_messages (telegram_id, message_text, message_type, forwarded_to_admin) 
       values ($1, $2, $3, false)`,
      [tgUser.id, messageText, messageType]
    );
    
    return null;
  }
};

const minutesFromNow = (m) => new Date(Date.now() + m * 60 * 1000);

const createLoginToken = async (tgUser) => {
  const token = makeToken();
  const expiresAt = minutesFromNow(10); // short-lived
  
  // Enhanced user data collection
  const userData = {
    token,
    telegramId: tgUser.id,
    username: tgUser.username || null,
    firstName: tgUser.first_name || null,
    lastName: tgUser.last_name || null,
    expiresAt,
  };
  
  await pool.query(
    `insert into tg_login_tokens (token, telegram_id, telegram_username, first_name, last_name, expires_at)
     values ($1, $2, $3, $4, $5, $6)`,
    [
      userData.token,
      userData.telegramId,
      userData.username,
      userData.firstName,
      userData.lastName,
      userData.expiresAt,
    ]
  );
  return { token, userData };
};

const makeAuthUrl = (token) => `${SITE_URL}/api/tg-auth?tg_token=${encodeURIComponent(token)}`;

bot.onText(/\/start(?:\s+(.*))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const tgUser = msg.from;

  try {
    await ErrorHandler.handleWithRetry(async () => {
      await ensureSchema();
      const { token, userData } = await createLoginToken(tgUser);
      const url = makeAuthUrl(token);

      // Create personalized welcome message
      const userName = userData.firstName || 'do\'st';
      const hasUsername = userData.username ? ` (@${userData.username})` : '';
      const suggestedUsername = userData.username || `tg_${userData.telegramId}`;
      
      const welcome = `Assalomu alaykum, ${userName}${hasUsername}!\n\n` +
        `🎯 Nimabalo - bu savollar va javoblar platformasi\n` +
        `💡 Sizning taklif qilinayotgan username: @${suggestedUsername}\n\n` +
        `Bir martalik havola orqali saytda tez kirish mumkin:`;

      await bot.sendMessage(chatId, welcome, {
        reply_markup: {
          inline_keyboard: [[{ text: '✅ Nimabaloga kirish', url }]],
        },
        disable_web_page_preview: true,
      });
      
      // Set up control keyboard after first interaction
      setTimeout(async () => {
        await setupControlKeyboard(chatId);
      }, 2000);
    }, 3, 'Start command');
  } catch (err) {
    console.error('Start handler error:', err);
    const userMessage = err.userMessage || 'Kutilmagan xatolik. Iltimos, qayta urining.';
    await bot.sendMessage(chatId, userMessage);
  }
});

// Fallback minimal command to regenerate link
bot.onText(/\/link/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const { token, userData } = await createLoginToken(msg.from);
    const url = makeAuthUrl(token);
    await bot.sendMessage(chatId, 'Yangi kirish havolasi tayyor:', {
      reply_markup: { inline_keyboard: [[{ text: '✅ Kirish', url }]] },
      disable_web_page_preview: true,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Link handler error', err);
    await bot.sendMessage(chatId, 'Xatolik yuz berdi. Iltimos, /start ni bosing.');
  }
});

// Congratulation and feedback flow for new users
bot.onText(/\/congrats/, async (msg) => {
  const chatId = msg.chat.id;
  const tgUser = msg.from;
  
  try {
    await ensureSchema();
    
    const congratulationMessage = `🎉 Tabriklaymiz, ${tgUser.first_name || 'do\'st'}!\n\n` +
      `✅ Nimabalo\'ga muvaffaqiyatli ro\'yxatdan o\'tdingiz!\n\n` +
      `💭 Bizga fikringizni bildiring - bu bizga yaxshilanish uchun yordam beradi:`;
    
    const feedbackKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📝 Fikr-mulohaza qoldirish', callback_data: 'feedback_start' }],
          [{ text: '🏠 Bosh sahifaga', callback_data: 'go_home' }]
        ]
      }
    };
    
    await bot.sendMessage(chatId, congratulationMessage, feedbackKeyboard);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Congrats handler error', err);
    await bot.sendMessage(chatId, 'Xatolik yuz berdi. Iltimos, qayta urining.');
  }
});

// Handle callback queries for feedback flow
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;
  const tgUser = callbackQuery.from;
  
  try {
    await bot.answerCallbackQuery(callbackQuery.id);
    
    if (data === 'feedback_start') {
      await startFeedbackFlow(chatId, tgUser);
    } else if (data === 'go_home') {
      await bot.sendMessage(chatId, '🏠 Bosh sahifaga qaytdingiz. Nimabalo\'da qiziqarli savollar va javoblar sizni kutmoqda!');
    } else if (data === 'new_login_link') {
      const { token } = await createLoginToken(tgUser);
      const url = makeAuthUrl(token);
      await bot.sendMessage(chatId, '🔗 Yangi kirish havolasi:', {
        reply_markup: { inline_keyboard: [[{ text: '✅ Nimabaloga kirish', url }]] }
      });
    } else if (data.startsWith('feedback_')) {
      await handleFeedbackResponse(chatId, tgUser, data);
    } else if (data.startsWith('rating_')) {
      await handleRatingResponse(chatId, tgUser, data);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Callback query error', err);
    await bot.sendMessage(chatId, 'Xatolik yuz berdi. Iltimos, qayta urining.');
  }
});

// Start the feedback flow
async function startFeedbackFlow(chatId, tgUser) {
  const question1 = `1️⃣ Nimabalo haqida qanday fikrda edingiz?\n\n` +
    `Platformani qanday topdingiz?`;
  
  const keyboard1 = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔍 Google orqali', callback_data: 'feedback_discovery_google' }],
        [{ text: '📱 Do\'stlar orqali', callback_data: 'feedback_discovery_friends' }],
        [{ text: '📺 Reklama orqali', callback_data: 'feedback_discovery_ads' }],
        [{ text: '💬 Telegram orqali', callback_data: 'feedback_discovery_telegram' }],
        [{ text: '✍️ Boshqa', callback_data: 'feedback_discovery_other' }]
      ]
    }
  };
  
  await bot.sendMessage(chatId, question1, keyboard1);
}

// Handle feedback responses
async function handleFeedbackResponse(chatId, tgUser, data) {
  const parts = data.split('_');
  const questionType = parts[1];
  const answer = parts.slice(2).join('_');
  
  // Save feedback to database
  await pool.query(
    `insert into tg_user_feedback (telegram_id, question_type, answer) values ($1, $2, $3)`,
    [tgUser.id, questionType, answer]
  );
  
  // Continue with next question based on current question
  if (questionType === 'discovery') {
    await askSecondQuestion(chatId, tgUser);
  } else if (questionType === 'experience') {
    await askThirdQuestion(chatId, tgUser);
  } else if (questionType === 'suggestions') {
    await finishFeedbackFlow(chatId, tgUser);
  } else if (answer === 'other') {
    await askForCustomAnswer(chatId, tgUser, questionType);
  }
}

// Second feedback question
async function askSecondQuestion(chatId, tgUser) {
  const question2 = `2️⃣ Nimabalo\'da qanday tajriba qildingiz?\n\n` +
    `Foydalanish qulayligi qanday edi?`;
  
  const keyboard2 = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '⭐ Juda yaxshi', callback_data: 'feedback_experience_excellent' }],
        [{ text: '👍 Yaxshi', callback_data: 'feedback_experience_good' }],
        [{ text: '😐 O\'rtacha', callback_data: 'feedback_experience_average' }],
        [{ text: '👎 Yomon', callback_data: 'feedback_experience_poor' }],
        [{ text: '✍️ Boshqa', callback_data: 'feedback_experience_other' }]
      ]
    }
  };
  
  await bot.sendMessage(chatId, question2, keyboard2);
}

// Third feedback question
async function askThirdQuestion(chatId, tgUser) {
  const question3 = `3️⃣ Nimabalo\'ni qanday yaxshilashimiz mumkin?\n\n` +
    `Qanday yangi funksiyalar kerak?`;
  
  const keyboard3 = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📱 Mobil ilova', callback_data: 'feedback_suggestions_mobile_app' }],
        [{ text: '🔔 Bildirishnomalar', callback_data: 'feedback_suggestions_notifications' }],
        [{ text: '🎨 Dizayn yaxshilash', callback_data: 'feedback_suggestions_design' }],
        [{ text: '⚡ Tezlik', callback_data: 'feedback_suggestions_speed' }],
        [{ text: '✍️ Boshqa', callback_data: 'feedback_suggestions_other' }]
      ]
    }
  };
  
  await bot.sendMessage(chatId, question3, keyboard3);
}

// Finish feedback flow
async function finishFeedbackFlow(chatId, tgUser) {
  const thankYouMessage = `🎉 Rahmat, ${tgUser.first_name || 'do\'st'}!\n\n` +
    `📝 Sizning fikr-mulohazangiz biz uchun juda qimmatli!\n` +
    `💡 Bu ma\'lumotlar Nimabalo\'ni yanada yaxshilashga yordam beradi.\n\n` +
    `🏠 Endi bosh sahifaga qayting va qiziqarli savollar bilan tanishing!`;
  
  const finalKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🏠 Bosh sahifaga', callback_data: 'go_home' }],
        [{ text: '🔗 Yangi kirish havolasi', callback_data: 'new_login_link' }]
      ]
    }
  };
  
  await bot.sendMessage(chatId, thankYouMessage, finalKeyboard);
}

// Ask for custom answer
async function askForCustomAnswer(chatId, tgUser, questionType) {
  const customMessage = `✍️ Iltimos, o'z javobingizni yozing:\n\n` +
    `(Xabar yuborish orqali javob bering)`;
  
  await bot.sendMessage(chatId, customMessage);
  
  // Store that we're waiting for custom input
  // This is a simple approach - in production you might want to use a state management system
}

// Handle text messages for custom feedback answers
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const tgUser = msg.from;
  
  // Simple check if this looks like a custom feedback answer
  // In production, you'd want a more robust state management system
  if (text && text.length > 10 && !text.startsWith('/')) {
    // This might be a custom feedback answer
    // For now, we'll just acknowledge it
    await bot.sendMessage(chatId, `📝 Rahmat! Sizning javobingiz qayd etildi: "${text}"`);
  }
});

// Create a simple HTTP server for Render (required for web services)
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', bot: 'running' }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Nimabalo Telegram Bot is running');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Telegram bot is running on port ${PORT}`);
});

// Set up persistent keyboard with control buttons
const setupControlKeyboard = async (chatId) => {
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
};

// Handle control button presses
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const tgUser = msg.from;
  
  // Skip if it's a command or very short text
  if (!text || text.startsWith('/') || text.length < 3) {
    return;
  }
  
  try {
    switch (text) {
      case '🏠 Bosh sahifa':
        await handleHomeButton(chatId, tgUser);
        break;
      case '💬 Fikr bildirish':
        await handleFeedbackButton(chatId, tgUser);
        break;
      case '🔗 Kirish havolasi':
        await handleLoginLinkButton(chatId, tgUser);
        break;
      case '📊 Statistika':
        await handleStatsButton(chatId, tgUser);
        break;
      case '❓ Yordam':
        await handleHelpButton(chatId, tgUser);
        break;
      case '⭐ Baholash':
        await handleRatingButton(chatId, tgUser);
        break;
      default:
        // Handle custom feedback messages
        if (text.length > 10 && !text.startsWith('/')) {
          await handleFeedbackMessage(chatId, tgUser, text);
        }
        break;
    }
  } catch (err) {
    console.error('Message handler error:', err);
    const userMessage = err.userMessage || 'Xatolik yuz berdi. Iltimos, qayta urining.';
    await bot.sendMessage(chatId, userMessage);
  }
});

// Control button handlers
async function handleHomeButton(chatId, tgUser) {
  const homeMessage = `🏠 Xush kelibsiz, ${tgUser.first_name || 'do\'st'}!\n\n` +
    `🎯 Nimabalo - bu savollar va javoblar platformasi\n` +
    `💡 Bu yerda siz savollar berishingiz va boshqalarning savollariga javob berishingiz mumkin.\n\n` +
    `📝 Yangi savol berish uchun tugmani bosing!`;
  
  await bot.sendMessage(chatId, homeMessage);
}

async function handleFeedbackButton(chatId, tgUser) {
  const feedbackMessage = `💬 Fikr-mulohaza bildirish:\n\n` +
    `📝 Nimabalo haqida fikringizni yozing:\n` +
    `• Qanday yaxshilash mumkin?\n` +
    `• Qanday muammolar bor?\n` +
    `• Qanday yangi funksiyalar kerak?\n\n` +
    `💡 Xabaringizni yozing va yuboring. Barcha fikr-mulohazalar admin\'ga yuboriladi.`;
  
  await bot.sendMessage(chatId, feedbackMessage);
}

async function handleFeedbackMessage(chatId, tgUser, messageText) {
  try {
    // Forward feedback to admin
    const adminMessageId = await forwardFeedbackToAdmin(tgUser, messageText, 'feedback');
    
    if (adminMessageId) {
      await bot.sendMessage(chatId, 
        `✅ Rahmat! Sizning fikr-mulohazangiz qabul qilindi va admin\'ga yuborildi.\n\n` +
        `💡 Sizning fikringiz biz uchun juda muhim va yaxshilanish uchun ishlatiladi.`
      );
    } else {
      await bot.sendMessage(chatId, 
        `✅ Rahmat! Sizning fikr-mulohazangiz qabul qilindi.\n\n` +
        `💡 Sizning fikringiz biz uchun juda muhim va yaxshilanish uchun ishlatiladi.`
      );
    }
  } catch (error) {
    console.error('Error handling feedback message:', error);
    await bot.sendMessage(chatId, 
      `❌ Fikr-mulohazangizni saqlashda muammo yuz berdi. Iltimos, qayta urining.`
    );
  }
}

async function handleLoginLinkButton(chatId, tgUser) {
  const { token } = await createLoginToken(tgUser);
  const url = makeAuthUrl(token);
  
  const linkMessage = `🔗 Yangi kirish havolasi tayyor!\n\n` +
    `Bu havola 10 daqiqa amal qiladi.`;
  
  const keyboard = {
    reply_markup: {
      inline_keyboard: [[{ text: '✅ Nimabaloga kirish', url }]]
    }
  };
  
  await bot.sendMessage(chatId, linkMessage, keyboard);
}

async function handleStatsButton(chatId, tgUser) {
  try {
    // Get user's login count
    const { rows } = await pool.query(
      `select count(*) as login_count from tg_login_tokens where telegram_id = $1 and consumed_at is not null`,
      [tgUser.id]
    );
    
    const loginCount = rows[0]?.login_count || 0;
    
    const statsMessage = `📊 Sizning statistikangiz:\n\n` +
      `🔑 Kirishlar soni: ${loginCount}\n` +
      `📅 Ro'yxatdan o'tgan: ${new Date().toLocaleDateString('uz-UZ')}\n\n` +
      `💡 Ko'proq faol bo'ling va savollar bilan tanishing!`;
    
    await bot.sendMessage(chatId, statsMessage);
  } catch (err) {
    await bot.sendMessage(chatId, '📊 Statistika ma\'lumotlari hozircha mavjud emas.');
  }
}

async function handleHelpButton(chatId, tgUser) {
  const helpMessage = `❓ Yordam va ma'lumotlar:\n\n` +
    `🎯 Nimabalo nima?\n` +
    `Savollar va javoblar uchun platforma\n\n` +
    `📝 Qanday savol beraman?\n` +
    `1. Saytga kiring\n` +
    `2. "Savol berish" tugmasini bosing\n` +
    `3. Savolingizni yozing\n\n` +
    `💬 Qanday javob beraman?\n` +
    `Boshqalarning savollariga javob yozing\n\n` +
    `💬 Fikr-mulohaza bildirish:\n` +
    `"Fikr bildirish" tugmasini bosing va xabaringizni yozing\n\n` +
    `🔗 Yangi havola kerak?\n` +
    `"Kirish havolasi" tugmasini bosing\n\n` +
    `📞 Aloqa: @nimabalo_support`;
  
  await bot.sendMessage(chatId, helpMessage);
}

async function handleRatingButton(chatId, tgUser) {
  const ratingMessage = `⭐ Nimabalo\'ni baholang!\n\n` +
    `Sizning fikringiz biz uchun juda muhim!`;
  
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '⭐ 5', callback_data: 'rating_5' }, { text: '⭐ 4', callback_data: 'rating_4' }],
        [{ text: '⭐ 3', callback_data: 'rating_3' }, { text: '⭐ 2', callback_data: 'rating_2' }],
        [{ text: '⭐ 1', callback_data: 'rating_1' }]
      ]
    }
  };
  
  await bot.sendMessage(chatId, ratingMessage, keyboard);
}

// Handle rating responses
async function handleRatingResponse(chatId, tgUser, data) {
  const rating = data.split('_')[1];
  const ratingText = ['', '1 yulduz', '2 yulduz', '3 yulduz', '4 yulduz', '5 yulduz'][parseInt(rating)];
  
  // Save rating to database
  await pool.query(
    `insert into tg_user_feedback (telegram_id, question_type, answer) values ($1, $2, $3)`,
    [tgUser.id, 'rating', ratingText]
  );
  
  const thankYouMessage = `⭐ Rahmat! Siz Nimabalo\'ni ${ratingText} bilan baholadingiz!\n\n` +
    `💡 Sizning fikringiz biz uchun juda muhim va yaxshilanish uchun ishlatiladi.`;
  
  await bot.sendMessage(chatId, thankYouMessage);
}

// Graceful shutdown
const shutdown = async () => {
  try {
    await bot.stopPolling();
    await pool.end();
    server.close(() => {
      // eslint-disable-next-line no-console
      console.log('Server closed');
      process.exit(0);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// eslint-disable-next-line no-console
console.log('Telegram bot is starting...');


