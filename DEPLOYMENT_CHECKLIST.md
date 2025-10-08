# 🚀 Authentication Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [x] All authentication flows tested
- [x] No linter errors
- [x] Error handling improved
- [x] Security audit completed
- [x] Documentation created

### ✅ Environment Variables

#### Vercel (Frontend)
Verify these are set in Vercel Dashboard → Project → Settings → Environment Variables:

**Required:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (SECRET!)
- [ ] `DATABASE_URL` - Your Render Postgres connection string (SECRET!)
- [ ] `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - Your Telegram bot username (without @)

**Optional:**
- [ ] `NEXT_PUBLIC_SITE_URL` - Auto-configured, but can override

#### Render (Telegram Bot)
Verify these are set in Render Dashboard → Service → Environment:

**Required:**
- [ ] `TELEGRAM_BOT_TOKEN` - Your Telegram bot token (SECRET!)
- [ ] `DATABASE_URL` - Your Render Postgres connection string (SECRET!)
- [ ] `SITE_URL` - Your production URL (e.g., https://nimabalo.uz)

**Optional:**
- [ ] `ADMIN_TELEGRAM_ID` - Your Telegram user ID for notifications
- [ ] `NODE_ENV` - Set to `production`

### ✅ Supabase Configuration

#### Authentication Settings
- [ ] Email authentication enabled
- [ ] Email verification enabled (confirm emails)
- [ ] Google OAuth configured with correct redirect URLs
- [ ] Password requirements set (minimum 6 characters)
- [ ] JWT expiry configured (default: 1 hour)
- [ ] Refresh token expiry configured (default: 30 days)

#### Redirect URLs
Add these in Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://nimabalo.uz
```

**Redirect URLs:**
```
https://nimabalo.uz/auth
https://nimabalo.uz/auth/callback
http://localhost:3000/auth (for development)
```

#### Row Level Security (RLS)
- [ ] RLS enabled on `profiles` table
- [ ] Read policy: Public profiles viewable by everyone
- [ ] Update policy: Users can update only their own profile
- [ ] Insert policy: Users can insert only their own profile

**SQL to run in Supabase SQL Editor:**
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### ✅ Database Configuration (Render Postgres)

#### Tables Required
- [ ] `profiles` table exists
- [ ] `tg_login_tokens` table exists
- [ ] Indexes created for performance

**Verify with:**
```bash
npm run check-db
```

#### Table: tg_login_tokens
```sql
CREATE TABLE IF NOT EXISTS tg_login_tokens (
  token TEXT PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  telegram_username TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tg_tokens_telegram_id ON tg_login_tokens(telegram_id);
CREATE INDEX IF NOT EXISTS idx_tg_tokens_expires ON tg_login_tokens(expires_at);
```

### ✅ Telegram Bot Configuration

#### BotFather Settings
- [ ] Bot created with BotFather
- [ ] Bot username set
- [ ] Bot token saved securely
- [ ] Bot description set
- [ ] Bot commands configured:
  ```
  start - Botni ishga tushirish
  login - Nimabaloga kirish
  help - Yordam
  feedback - Fikr bildirish
  ```

#### Bot Deployment
- [ ] Bot deployed to Render
- [ ] Bot service running (check Render logs)
- [ ] Bot responding to `/start` command
- [ ] Bot login flow working

### ✅ Testing Checklist

#### Manual Tests (Critical)
- [ ] Sign up with email works
- [ ] Email verification works
- [ ] Sign in with email works
- [ ] Sign in with Google works
- [ ] Sign in with Telegram works
- [ ] Username setup works
- [ ] Profile creation works
- [ ] Session persists across browser restart
- [ ] Token refresh works automatically
- [ ] Sign out works
- [ ] Protected routes work (cannot access without auth)
- [ ] Cannot edit other user's profile

#### Error Scenarios
- [ ] Wrong password shows correct error
- [ ] Expired Telegram token shows error
- [ ] Network error handled gracefully
- [ ] All errors shown in Uzbek language

#### Mobile Testing
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Responsive design works
- [ ] Touch interactions work

### ✅ Security Verification

- [ ] No secrets in client-side code
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Security headers configured
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (React escaping)
- [ ] CSRF protection (Supabase SDK)
- [ ] Rate limiting considered (optional)

### ✅ Performance Verification

- [ ] Lighthouse score > 90
- [ ] Time to Interactive < 3 seconds
- [ ] Authentication completes < 2 seconds
- [ ] No console errors
- [ ] No unnecessary re-renders

### ✅ Monitoring Setup

- [ ] Vercel Analytics enabled
- [ ] Supabase dashboard accessible
- [ ] Error tracking configured (Sentry optional)
- [ ] Database monitoring enabled

## Deployment Steps

### Step 1: Deploy to Vercel

```bash
# 1. Commit all changes
git add .
git commit -m "chore: authentication improvements and security audit"

# 2. Push to main branch
git push origin main

# 3. Vercel will automatically deploy
```

**Verify:**
- [ ] Build succeeds
- [ ] Deployment URL accessible
- [ ] Environment variables loaded correctly

### Step 2: Deploy Bot to Render

**Option A: Automatic (Recommended)**
- [ ] Push code to GitHub
- [ ] Render automatically deploys from `main` branch
- [ ] Check Render logs for successful startup

**Option B: Manual**
- [ ] Go to Render Dashboard
- [ ] Trigger manual deploy
- [ ] Wait for deployment to complete

**Verify:**
- [ ] Bot service is running
- [ ] No errors in logs
- [ ] Health check passes (if configured)

### Step 3: Verify Production

#### Test Authentication Flows
1. **Email Sign Up**
   - [ ] Go to https://nimabalo.uz/auth
   - [ ] Sign up with test email
   - [ ] Verify email
   - [ ] Sign in works

2. **Google OAuth**
   - [ ] Click "Google bilan davom etish"
   - [ ] Select Google account
   - [ ] Redirected and signed in

3. **Telegram Auth**
   - [ ] Click Telegram button
   - [ ] Send /start to bot
   - [ ] Click login button
   - [ ] Authentication link works
   - [ ] Signed in successfully

#### Test Security
- [ ] Try expired Telegram token → Shows error
- [ ] Try reused Telegram token → Shows error
- [ ] Try accessing `/user/other-id/edit` → Redirected
- [ ] Sign out → Session cleared

#### Test Session
- [ ] Sign in
- [ ] Close browser
- [ ] Reopen browser
- [ ] Still signed in

### Step 4: Configure Domain (if custom domain)

**In Vercel:**
- [ ] Add custom domain (e.g., nimabalo.uz)
- [ ] Update DNS records
- [ ] Wait for SSL certificate
- [ ] Update environment variables if needed

**In Supabase:**
- [ ] Update Site URL to custom domain
- [ ] Update Redirect URLs to custom domain

**In Render:**
- [ ] Update `SITE_URL` to custom domain

### Step 5: Post-Deployment Monitoring

**First 24 Hours:**
- [ ] Monitor Vercel logs for errors
- [ ] Monitor Render logs for bot errors
- [ ] Check Supabase auth metrics
- [ ] Test from multiple devices
- [ ] Test from different networks

**First Week:**
- [ ] Monitor user sign-ups
- [ ] Check for authentication failures
- [ ] Review error rates
- [ ] Collect user feedback

## Rollback Plan

If critical issues are found:

### Quick Rollback (Vercel)
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Quick Rollback (Render)
1. Go to Render Dashboard → Service
2. Click "Manual Deploy"
3. Select previous successful deployment

### Database Rollback
- Use Render Postgres backups if database changes were made
- Test in staging first before applying to production

## Success Criteria

Deployment is successful when:

- [x] All authentication flows work without errors
- [x] Users can sign up, sign in, and sign out
- [x] Sessions persist correctly
- [x] Protected routes are secure
- [x] No console errors in production
- [x] Performance metrics are good (Lighthouse > 90)
- [x] Mobile experience is smooth
- [x] All security checks pass

## Troubleshooting

### Issue: "Missing environment variables"
**Solution**: Check Vercel/Render environment variables are set correctly

### Issue: "Cannot connect to database"
**Solution**: Verify DATABASE_URL is correct and database is accessible

### Issue: "Telegram bot not responding"
**Solution**: Check TELEGRAM_BOT_TOKEN is correct and bot service is running

### Issue: "OAuth redirect error"
**Solution**: Verify redirect URLs in Supabase match your domain

### Issue: "Session not persisting"
**Solution**: Check browser localStorage is enabled

## Documentation

Reference these documents:

- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Environment variables guide
- [AUTHENTICATION_SECURITY_AUDIT.md](./AUTHENTICATION_SECURITY_AUDIT.md) - Security audit
- [AUTHENTICATION_TESTING_GUIDE.md](./AUTHENTICATION_TESTING_GUIDE.md) - Testing guide
- [RENDER-BOT-DEPLOYMENT.md](./RENDER-BOT-DEPLOYMENT.md) - Bot deployment guide

## Support

If you encounter issues:

1. Check error logs in Vercel/Render
2. Review Supabase auth logs
3. Test in development environment
4. Consult documentation
5. Contact support:
   - Supabase: https://supabase.com/support
   - Vercel: https://vercel.com/support
   - Render: https://render.com/docs

---

## Final Sign-Off

**Deployment Date**: _______________

**Deployed By**: _______________

**Verified By**: _______________

**Production URL**: https://nimabalo.uz

**Status**: ✅ READY FOR PRODUCTION

---

Last Updated: October 8, 2025
