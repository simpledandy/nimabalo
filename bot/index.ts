import TelegramBot from 'node-telegram-bot-api';
import { initDb } from './db';
import { getSiteUrl } from './utils';
import { setupHandlers } from './handlers';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;
const SITE_URL = getSiteUrl();
const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;

if (!BOT_TOKEN) {
  console.error('❌ Missing TELEGRAM_BOT_TOKEN');
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL');
  process.exit(1);
}

const pool = initDb(DATABASE_URL);

// Bot init (long polling)
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Wire up handlers
setupHandlers(bot, pool, ADMIN_TELEGRAM_ID);

// Simple health server
import http from 'http';
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
  console.log(`✅ Telegram bot is running on port ${PORT}`);
  console.log(`🌐 Site URL: ${SITE_URL}`);
  console.log(`🔐 Admin ID: ${ADMIN_TELEGRAM_ID ? 'SET' : 'NOT SET'}`);
  console.log(`💾 Database: ${DATABASE_URL ? 'CONNECTED' : 'NOT CONNECTED'}`);
});

// Graceful shutdown
const shutdown = async () => {
  try {
    // @ts-ignore
    await bot.stopPolling();
    await pool.end();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('Telegram bot is starting...');
