# Telegram Bot Deployment on Vercel

This setup allows you to deploy both your Next.js web app AND the Telegram bot with a single push to Vercel.

## How It Works

1. **Web App**: Deploys normally as a Next.js app
2. **Bot**: Deploys as a Vercel serverless function at `/api/bot`
3. **Webhook**: Telegram sends updates to your Vercel function instead of polling

## Setup Instructions

### 1. Push Your Code
```bash
git add .
git commit -m "Add Telegram bot as Vercel function"
git push origin dev/telegram-auth
```

### 2. Set Environment Variables in Vercel
Add these to your Vercel project settings:

**For Web App:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - Your bot username

**For Bot Function:**
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token (same as above)
- `WEBHOOK_URL` - Your Vercel deployment URL + `/api/bot`

### 3. Set Up Webhook (One-time)
After your first deployment, run this locally to configure the webhook:

```bash
# Set your deployment URL
export WEBHOOK_URL="https://your-deployment-url.vercel.app/api/bot"
export TELEGRAM_BOT_TOKEN="your_bot_token"

# Set up the webhook
npm run setup-webhook
```

### 4. Test
1. Go to your Telegram bot
2. Send `/start`
3. Click the "Nimabaloga kirish" button
4. You should be redirected to your app and logged in!

## Architecture

```
User → Telegram Bot → Vercel Function (/api/bot) → Database
                                    ↓
                              Web App (/auth) ← Supabase
```

## Benefits

✅ **Single Deployment**: Push once, deploy both app and bot  
✅ **No Server Management**: Vercel handles everything  
✅ **Automatic Scaling**: Serverless functions scale automatically  
✅ **Cost Effective**: Only pay for actual usage  
✅ **Same Environment**: Bot and web app share the same environment variables  

## Troubleshooting

### Bot Not Responding
1. Check that `TELEGRAM_BOT_TOKEN` is set in Vercel
2. Verify webhook is set up correctly
3. Check Vercel function logs

### Authentication Not Working
1. Verify `DATABASE_URL` is the same for both app and bot
2. Check that `NEXT_PUBLIC_SITE_URL` is set correctly
3. Ensure all Supabase environment variables are set

### Webhook Setup Failed
1. Make sure `WEBHOOK_URL` includes the full path `/api/bot`
2. Verify your Vercel deployment is live
3. Check that the bot token is correct
