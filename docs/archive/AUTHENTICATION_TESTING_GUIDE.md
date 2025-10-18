# Authentication Testing Guide

## Overview
This guide helps you test all authentication flows before deploying to production.

## 🧪 Test Environments

### Local Development
```bash
# 1. Set up environment variables
cp ENV_VARIABLES.md .env.local
# Edit .env.local with your credentials

# 2. Start the development server
npm run dev

# 3. Access at http://localhost:3000
```

### Preview Deployment (Vercel)
- Push to a feature branch
- Vercel automatically creates a preview deployment
- Test with preview URL

### Production
- Only deploy after all tests pass
- Use production credentials

## 🔍 Test Scenarios

### 1. Email/Password Authentication

#### Test: Sign Up with Email
**Steps**:
1. Navigate to `/auth`
2. Click "Ro'yxatdan o'tish" (Sign Up)
3. Enter email: `test@example.com`
4. Enter password: `TestPassword123!`
5. Click sign up button

**Expected Result**:
- ✅ User receives verification email
- ✅ Success message displayed
- ✅ User redirected to auth page
- ✅ Verification link works
- ✅ After verification, user can sign in

**Test Cases**:
```
1. Valid email + Valid password → Success
2. Invalid email → Error: "Email noto'g'ri formatda"
3. Short password (< 6 chars) → Error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
4. Existing email → Error: "Ushbu email allaqachon ro'yxatdan o'tgan"
5. Empty fields → Error: "Maydonlarni to'ldiring"
```

#### Test: Sign In with Email
**Steps**:
1. Navigate to `/auth`
2. Enter registered email
3. Enter password
4. Click sign in

**Expected Result**:
- ✅ User signed in successfully
- ✅ Welcome toast displayed
- ✅ Username setup shown (if no username)
- ✅ Redirected to profile or home

**Test Cases**:
```
1. Correct credentials → Success
2. Wrong password → Error: "Email yoki parol noto'g'ri"
3. Unverified email → Error: "Emailni tasdiqlang"
4. Non-existent email → Error: "Email yoki parol noto'g'ri"
```

### 2. Google OAuth Authentication

#### Test: Sign In with Google
**Steps**:
1. Navigate to `/auth`
2. Click "Google bilan davom etish"
3. Select Google account
4. Grant permissions

**Expected Result**:
- ✅ User signed in successfully
- ✅ Profile created with Google data
- ✅ Username setup shown (if needed)
- ✅ Redirected to profile

**Edge Cases**:
```
1. First time Google sign-in → Creates profile
2. Existing Google user → Signs in directly
3. Cancel OAuth flow → Returns to auth page
4. Network error during OAuth → Error message shown
```

### 3. Telegram Authentication

#### Test: Sign In with Telegram
**Steps**:
1. Navigate to `/auth`
2. Click Telegram button
3. Opens Telegram bot
4. Click "Nimabaloga kirish" in bot
5. Bot sends authentication link
6. Click link in Telegram

**Expected Result**:
- ✅ Redirected to auth page with tokens
- ✅ User signed in automatically
- ✅ Profile created with Telegram data
- ✅ Username setup shown (if needed)

**Test Cases**:
```
1. Valid token → Success
2. Expired token (>5 min) → Error: "Token expired"
3. Already used token → Error: "Token expired or already used"
4. Invalid token → Error: "Token not provided"
5. Token from different user → Creates new user
```

#### Test: Telegram Token Expiration
**Steps**:
1. Get authentication link from bot
2. Wait 6 minutes (token expires after 5 min)
3. Click link

**Expected Result**:
- ✅ Error: "Token expired or already used"
- ✅ User can request new token

#### Test: Telegram Token Reuse
**Steps**:
1. Get authentication link from bot
2. Click link and sign in
3. Try clicking same link again

**Expected Result**:
- ✅ Error: "Token expired or already used"
- ✅ User remains signed in from first use

### 4. Username Setup Flow

#### Test: First Time User
**Steps**:
1. Sign up with new email or OAuth
2. Complete authentication
3. Username setup screen appears

**Expected Result**:
- ✅ Username setup screen shown
- ✅ Suggested username displayed
- ✅ Can customize username
- ✅ Real-time validation works
- ✅ Can skip username setup

**Test Cases**:
```
1. Accept suggested username → Success
2. Custom valid username → Success
3. Username already taken → Error shown, can retry
4. Invalid characters → Error shown
5. Skip setup → Can set username later in profile
```

### 5. Session Management

#### Test: Session Persistence
**Steps**:
1. Sign in
2. Close browser
3. Open browser again
4. Navigate to site

**Expected Result**:
- ✅ User still signed in
- ✅ No need to sign in again

#### Test: Session Refresh
**Steps**:
1. Sign in
2. Wait for 55 minutes (token refreshes at ~55 min)
3. Continue using site

**Expected Result**:
- ✅ Token refreshed automatically
- ✅ No interruption to user
- ✅ Console shows "Session token refreshed successfully"

#### Test: Session Expiration
**Steps**:
1. Sign in
2. Manually delete localStorage keys
3. Refresh page

**Expected Result**:
- ✅ User signed out
- ✅ Redirected to auth page (for protected routes)

### 6. Protected Routes

#### Test: Edit Profile Without Auth
**Steps**:
1. Sign out (if signed in)
2. Navigate to `/user/some-id/edit`

**Expected Result**:
- ✅ Redirected to `/auth`
- ✅ No access to edit page

#### Test: Edit Other User's Profile
**Steps**:
1. Sign in as User A
2. Try to access `/user/user-b-id/edit`

**Expected Result**:
- ✅ Redirected to home page
- ✅ Cannot edit other user's profile

### 7. Error Handling

#### Test: Network Errors
**Steps**:
1. Open DevTools → Network tab
2. Set to "Offline"
3. Try to sign in

**Expected Result**:
- ✅ Error message: "Tarmoq bilan bog'lanishda muammo"
- ✅ User can retry when online

#### Test: Server Errors
**Steps**:
1. Temporarily disable Supabase
2. Try to sign in

**Expected Result**:
- ✅ Generic error message shown
- ✅ Error logged to console
- ✅ User can retry

### 8. Sign Out

#### Test: Sign Out Flow
**Steps**:
1. Sign in
2. Click sign out button
3. Confirm sign out

**Expected Result**:
- ✅ Confirmation modal shown
- ✅ After confirmation, user signed out
- ✅ Session cleared
- ✅ Redirected appropriately

## 🤖 Automated Testing

### Test Authentication Flows
```bash
# Install testing dependencies
npm install --save-dev @playwright/test

# Run tests
npm run test:e2e
```

### Example Test (Playwright)
```javascript
test('should sign in with email and password', async ({ page }) => {
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'TestPassword123!');
  await page.click('button:has-text("Kirish")');
  await expect(page).toHaveURL(/\/user|\/$/);
});
```

## 🧩 Integration Testing

### Test: Database Connection
```bash
npm run check-db
```

**Expected Output**:
```
✅ Database connection successful
✅ tg_login_tokens table exists
✅ profiles table exists
```

### Test: Supabase Configuration
```javascript
// In browser console on /auth page
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
// Should show URL, not undefined
```

### Test: Bot Connection
```bash
cd bot
node index.js
```

**Expected Output**:
```
✅ Telegram bot is running on port XXXX
✅ Database connection successful
```

## 📊 Test Coverage Checklist

### Email/Password Auth
- [ ] Sign up with valid email
- [ ] Sign up with existing email (should fail)
- [ ] Sign up with invalid email (should fail)
- [ ] Sign up with weak password (should fail)
- [ ] Sign in with correct credentials
- [ ] Sign in with wrong password (should fail)
- [ ] Sign in with unverified email (should fail)
- [ ] Email verification link works
- [ ] Password reset works

### OAuth (Google)
- [ ] First-time Google sign in
- [ ] Returning Google user
- [ ] Cancel OAuth flow
- [ ] Multiple Google accounts

### Telegram Auth
- [ ] Valid token authentication
- [ ] Expired token (should fail)
- [ ] Reused token (should fail)
- [ ] Token from different user
- [ ] Network error during auth

### Username Setup
- [ ] Suggested username works
- [ ] Custom username works
- [ ] Duplicate username validation
- [ ] Invalid character validation
- [ ] Skip username setup
- [ ] Set username later in profile

### Session Management
- [ ] Session persistence across browser restarts
- [ ] Automatic token refresh
- [ ] Sign out clears session
- [ ] Session expiration handling
- [ ] Concurrent sessions (multiple devices)

### Protected Routes
- [ ] Cannot access edit page without auth
- [ ] Cannot edit other user's profile
- [ ] Proper redirects after sign in

### Error Handling
- [ ] Network errors
- [ ] Server errors
- [ ] Invalid input errors
- [ ] All errors shown in Uzbek
- [ ] No sensitive data in error messages

### Profile Creation
- [ ] Profile created on first sign in
- [ ] Profile reused on subsequent sign ins
- [ ] Retry logic works if creation fails
- [ ] Race condition handling

## 🐛 Known Issues and Edge Cases

### Issue: Profile Creation Delay
**Symptom**: Profile not immediately available after sign up
**Solution**: Retry logic implemented (up to 5 times, 500ms apart)
**Test**: Sign up and immediately try to access profile

### Issue: Token Already Used
**Symptom**: Error when clicking Telegram link twice
**Solution**: This is expected behavior (security feature)
**Test**: Get new link from bot

### Issue: Username Already Taken
**Symptom**: Error when trying to set duplicate username
**Solution**: Try different username or use suggested one
**Test**: Try to use an existing username

## 📝 Manual Testing Checklist

Before deploying to production:

- [ ] Test email sign up and verification
- [ ] Test email sign in
- [ ] Test Google OAuth sign in
- [ ] Test Telegram authentication
- [ ] Test username setup flow
- [ ] Test session persistence
- [ ] Test protected routes
- [ ] Test sign out
- [ ] Test all error scenarios
- [ ] Test on mobile devices
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test with slow network
- [ ] Test with ad blockers enabled
- [ ] Verify no console errors
- [ ] Verify all text is in Uzbek
- [ ] Verify responsive design

## 🎯 Performance Testing

### Metrics to Track
- Time to sign in: < 2 seconds
- Time to load auth page: < 1 second
- Time to create profile: < 1 second
- Token refresh: Should be invisible to user

### Tools
- Lighthouse (in Chrome DevTools)
- Vercel Analytics
- Supabase Dashboard

## 📞 Reporting Issues

If you find an issue during testing:

1. **Document**:
   - What you did (steps to reproduce)
   - What you expected
   - What actually happened
   - Screenshots if applicable
   - Browser and device info

2. **Check**:
   - Is it already a known issue?
   - Can you reproduce it?
   - Does it happen in different browsers?

3. **Report**:
   - Create a GitHub issue
   - Include all documentation
   - Tag as `bug` and `authentication`

---

Last Updated: October 8, 2025
