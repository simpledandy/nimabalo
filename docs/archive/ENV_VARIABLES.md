# Environment Variables Required for Authentication

## Supabase Configuration (Required for Authentication)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Database (Required for Telegram Authentication)
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

## Telegram Bot (Required for Telegram Login)
```
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_BOT_TOKEN=your-bot-token-here
```

## Site URL (Auto-configured in next.config.mjs, but can override)
```
# NEXT_PUBLIC_SITE_URL=https://nimabalo.uz
```

## Admin Configuration (Optional - for feedback notifications)
```
# ADMIN_TELEGRAM_ID=123456789
```

## Node Environment
```
NODE_ENV=development
```

## Setup Instructions

### For Development:
1. Copy this file to `.env.local` in the project root
2. Fill in all required values
3. Never commit `.env.local` to git

### For Production (Vercel):
Add these variables in your Vercel project settings:
- Dashboard → Your Project → Settings → Environment Variables

### For Bot Deployment (Render):
Add these variables in your Render service settings:
- TELEGRAM_BOT_TOKEN
- DATABASE_URL
- SITE_URL (or let it auto-detect from deployment)
- ADMIN_TELEGRAM_ID (optional)
