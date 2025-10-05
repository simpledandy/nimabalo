# Telegram Bot Deployment on Render

This guide will help you deploy your Telegram bot on Render while keeping your frontend on Vercel.

## Architecture

```
User → Telegram Bot (Render) → Database (Render Postgres) → Web App (Vercel) → Supabase
```

## Step 1: Check Your Database

First, make sure your database has the required tables:

```bash
export DATABASE_URL="your_render_postgres_url"
npm run check-db
```

This will:
- Check if `tg_login_tokens` table exists (creates it if missing)
- Verify your Supabase tables are present

## Step 2: Deploy Bot on Render

### Option A: Using Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `nimabalo-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run bot`
   - **Plan**: Free

### Option B: Using render.yaml (Recommended)

1. Push your code with the `render.yaml` file
2. Go to Render Dashboard
3. Click "New" → "Blueprint"
4. Connect your repository
5. Render will automatically detect and use the `render.yaml` configuration

## Step 3: Set Environment Variables

In your Render service, add these environment variables:

### Required Variables:
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `DATABASE_URL` - Your Render Postgres database URL
- `SITE_URL` - Your Vercel deployment URL (e.g., `https://nimabalo.uz` or your preview URL)

### Optional Variables:
- `NODE_ENV` - Set to `production`

## Step 4: Update Vercel Environment Variables

In your Vercel project, make sure you have:
- `DATABASE_URL` - Same as Render (for the `/api/tg-auth` endpoint)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - Your bot username

## Step 5: Test the Deployment

1. **Check Bot Status**: Your bot should start automatically on Render
   - The bot will bind to the PORT environment variable (Render sets this automatically)
   - You can check the health endpoint: `https://your-bot-url.onrender.com/health`
2. **Test Bot**: Send `/start` to your bot
3. **Test Authentication**: Click the "Nimabaloga kirish" button

## Troubleshooting

### Bot Not Responding
- Check Render logs for errors
- Verify `TELEGRAM_BOT_TOKEN` is set correctly
- Ensure `DATABASE_URL` points to your Render database
- Check that the service is binding to a port (should show "Telegram bot is running on port XXXX" in logs)

### Authentication Not Working
- Verify `SITE_URL` points to your Vercel deployment
- Check that `DATABASE_URL` is the same in both Render and Vercel
- Ensure all Supabase environment variables are set in Vercel

### Database Issues
- Run `npm run check-db` to verify tables exist
- Check Render Postgres logs if needed

## Environment Variables Summary

### Render (Bot):
```
TELEGRAM_BOT_TOKEN=your_bot_token
DATABASE_URL=your_render_postgres_url
SITE_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
```

### Vercel (Web App):
```
DATABASE_URL=your_render_postgres_url (same as Render)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

## Benefits of This Setup

✅ **Separate Concerns**: Bot and web app can scale independently  
✅ **Cost Effective**: Render free tier for bot, Vercel for frontend  
✅ **Shared Database**: Both services use the same Render Postgres  
✅ **Easy Debugging**: Separate logs for bot and web app  
✅ **Flexible Deployment**: Can update bot without affecting web app  

## Next Steps

1. Push your code to GitHub
2. Deploy bot on Render
3. Set environment variables
4. Test the complete flow
5. Update your preview deployment URL in Render when testing
