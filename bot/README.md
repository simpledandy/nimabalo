# Nimabalo Telegram Bot (TypeScript)

This folder contains a refactored TypeScript version of the original `bot/index.js` script.

Files:
- `types.ts` - shared TypeScript types and BotError
- `utils.ts` - helper utilities
- `db.ts` - database initialization and schema
- `client.ts` - token generation and login helpers
- `errorHandler.ts` - retry and error processing logic
- `handlers.ts` - Telegram handlers (start, keyboard setup, etc.)
- `index.ts` - entrypoint to initialize bot and HTTP server

Quick setup:
1. Install dependencies:

```powershell
npm i
npm i -D typescript @types/node @types/pg
npm i -D @types/node-telegram-bot-api || echo "If @types doesn't exist, a local d.ts is provided"
```

2. Build / run (Node 18+ recommended):

```powershell
npx tsc --init --rootDir bot --outDir dist
npx tsc -p .
node dist/bot/index.js
```

Webhook setup (Vercel deployment)
---------------------------------

1. Generate a secure secret token for Telegram webhook. On Windows PowerShell you can run:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add it to your Vercel environment as `TELEGRAM_WEBHOOK_SECRET`.

2. Add these environment variables in Vercel (Project → Settings → Environment Variables):

- `TELEGRAM_BOT_TOKEN`
- `DATABASE_URL` (you can keep using Render Postgres if you prefer)
- `ADMIN_TELEGRAM_ID` (optional)
- `TELEGRAM_WEBHOOK_SECRET` (the secret you generated)

3. Set the webhook using the provided PowerShell script:

```powershell
.\bot\set-webhook.ps1 -BotToken $env:TELEGRAM_BOT_TOKEN -WebhookUrl 'https://your-site.vercel.app/api/telegram/webhook' -Secret '<your-secret>'
```

Or using curl:

```bash
curl -F "url=https://your-site.vercel.app/api/telegram/webhook" -F "secret_token=<your-secret>" https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook
```

Notes
-----
- You can keep using your existing Render Postgres `DATABASE_URL` if you prefer; the bot just needs a reachable Postgres instance. This lets you move only the bot to Vercel while your database stays on Render.
- Serverless webhooks are recommended for production (low ops). For heavy background work, use a worker or Supabase Functions.

Local development
-----------------

To run the bot locally with long polling (useful while developing handlers):

```powershell
# install deps
npm install

# set env vars in your shell (or use a .env file)
$env:TELEGRAM_BOT_TOKEN = 'your-token'
$env:DATABASE_URL = 'postgres://...'

# run
node ./bot/dev-poll.ts
```

When you're ready to deploy to Vercel, switch to webhook mode using the instructions above.

Notes:
- A minimal `types_node_telegram_bot_api.d.ts` is provided to silence TypeScript errors. If an official `@types` exists, prefer installing it.
- This refactor is intentionally minimal; additional handlers can be migrated in `handlers.ts` or split into files per feature.
