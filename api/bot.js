// Telegram Bot as Vercel Serverless Function
// This runs the bot logic when triggered by webhooks

const TelegramBot = require('node-telegram-bot-api');
const { Pool } = require('pg');
const { customAlphabet } = require('nanoid');

// Bot configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

if (!BOT_TOKEN) {
  console.error('Missing TELEGRAM_BOT_TOKEN');
  throw new Error('Bot token not configured');
}

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  throw new Error('Database not configured');
}

// DB setup
const pool = new Pool({ 
  connectionString: DATABASE_URL, 
  ssl: { rejectUnauthorized: false },
  max: 1, // Limit connections for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Create table if not exists
const ensureSchema = async () => {
  try {
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
    `);
  } catch (error) {
    console.error('Schema setup error:', error);
  }
};

const nano = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 36);
const makeToken = () => nano();

const minutesFromNow = (m) => new Date(Date.now() + m * 60 * 1000);

const createLoginToken = async (tgUser) => {
  const token = makeToken();
  const expiresAt = minutesFromNow(10); // short-lived
  
  try {
    await pool.query(
      `insert into tg_login_tokens (token, telegram_id, telegram_username, first_name, last_name, expires_at)
       values ($1, $2, $3, $4, $5, $6)`,
      [
        token,
        tgUser.id,
        tgUser.username || null,
        tgUser.first_name || null,
        tgUser.last_name || null,
        expiresAt,
      ]
    );
    return token;
  } catch (error) {
    console.error('Error creating login token:', error);
    throw error;
  }
};

const makeAuthUrl = (token) => `${SITE_URL}/api/tg-auth?tg_token=${encodeURIComponent(token)}`;

// Initialize bot (webhook mode for serverless)
let bot;
try {
  bot = new TelegramBot(BOT_TOKEN, { polling: false });
} catch (error) {
  console.error('Bot initialization error:', error);
}

// Handle /start command
const handleStart = async (msg) => {
  const chatId = msg.chat.id;
  const tgUser = msg.from;

  try {
    await ensureSchema();
    const token = await createLoginToken(tgUser);
    const url = makeAuthUrl(token);

    const welcome = `Assalomu alaykum, ${tgUser.first_name || 'do'st'}!\n\nBir martalik havola orqali saytda tez kirish mumkin.`;

    await bot.sendMessage(chatId, welcome, {
      reply_markup: {
        inline_keyboard: [[{ text: '✅ Nimabaloga kirish', url }]],
      },
      disable_web_page_preview: true,
    });
  } catch (err) {
    console.error('Start handler error', err);
    await bot.sendMessage(chatId, 'Kutilmagan xatolik. Iltimos, qayta urining.');
  }
};

// Handle /link command
const handleLink = async (msg) => {
  const chatId = msg.chat.id;
  try {
    const token = await createLoginToken(msg.from);
    const url = makeAuthUrl(token);
    await bot.sendMessage(chatId, 'Yangi kirish havolasi tayyor:', {
      reply_markup: { inline_keyboard: [[{ text: '✅ Kirish', url }]] },
      disable_web_page_preview: true,
    });
  } catch (err) {
    console.error('Link handler error', err);
    await bot.sendMessage(chatId, 'Xatolik yuz berdi. Iltimos, /start ni bosing.');
  }
};

// Main handler function for Vercel
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    
    // Handle different types of updates
    if (update.message) {
      const message = update.message;
      
      if (message.text) {
        if (message.text.startsWith('/start')) {
          await handleStart(message);
        } else if (message.text.startsWith('/link')) {
          await handleLink(message);
        }
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Bot handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Initialize schema on cold start
if (bot) {
  ensureSchema().catch(console.error);
}
