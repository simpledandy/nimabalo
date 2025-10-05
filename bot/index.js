'use strict';

// Minimal Telegram bot for one-tap auth via deep-link
// Env required:
// - TELEGRAM_BOT_TOKEN
// - DATABASE_URL (Render Postgres)
// - SITE_URL (e.g. https://nimabalo.uz or http://localhost:3000)

const TelegramBot = require('node-telegram-bot-api');
const { Pool } = require('pg');
const { customAlphabet } = require('nanoid');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;
const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

if (!BOT_TOKEN) {
  // eslint-disable-next-line no-console
  console.error('Missing TELEGRAM_BOT_TOKEN');
  process.exit(1);
}
if (!DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

// DB setup
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Create table if not exists (id, token, telegram_id, username, created_at, expires_at, consumed_at)
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
  `);
};

const nano = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 36);
const makeToken = () => nano();

// Bot init (long polling for simplicity)
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const minutesFromNow = (m) => new Date(Date.now() + m * 60 * 1000);

const createLoginToken = async (tgUser) => {
  const token = makeToken();
  const expiresAt = minutesFromNow(10); // short-lived
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
};

const makeAuthUrl = (token) => `${SITE_URL}/api/tg-auth?tg_token=${encodeURIComponent(token)}`;

bot.onText(/\/start(?:\s+(.*))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const tgUser = msg.from;

  try {
    await ensureSchema();
    const token = await createLoginToken(tgUser);
    const url = makeAuthUrl(token);

    const welcome = `Assalomu alaykum, ${tgUser.first_name || 'do‘st'}!\n\nBir martalik havola orqali saytda tez kirish mumkin.`;

    await bot.sendMessage(chatId, welcome, {
      reply_markup: {
        inline_keyboard: [[{ text: '✅ Nimabaloga kirish', url }]],
      },
      disable_web_page_preview: true,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Start handler error', err);
    await bot.sendMessage(chatId, 'Kutilmagan xatolik. Iltimos, qayta urining.');
  }
});

// Fallback minimal command to regenerate link
bot.onText(/\/link/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const token = await createLoginToken(msg.from);
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


