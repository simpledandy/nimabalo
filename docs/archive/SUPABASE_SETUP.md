# 🎯 Supabase Setup - Quick Guide

## ✅ What You Need to Do

### 1. Add `avatar_url` Column (Required)

Open Supabase Dashboard → SQL Editor → Run this:

```sql
-- Add avatar_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add helpful comment
COMMENT ON COLUMN profiles.avatar_url 
IS 'DiceBear avatar URL - auto-generated from username, no uploads';
```

**That's it!** ✅

---

## 📋 Verification

Run this to confirm it worked:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'avatar_url';
```

Expected result:
```
column_name  | data_type | is_nullable
-------------|-----------|------------
avatar_url   | text      | YES
```

---

## 🧪 Test the Flow

### 1. Sign up as a new user
- Go to `/auth`
- Create account with email or Google

### 2. Complete onboarding
- **Step 1**: Enter full name and username
- **Step 2**: Choose avatar style (click paint icon 🎨)
- Click "Create Profile"

### 3. Verify everything works
- ✅ Avatar shows in navbar (top right)
- ✅ Avatar shows in profile page
- ✅ Avatar shows in question/answer cards
- ✅ Can edit avatar in profile settings

---

## 🎨 Avatar Features

### How It Works
1. User chooses avatar style during signup
2. Avatar URL is generated: `https://api.dicebear.com/7.x/{style}/svg?seed={username}`
3. URL is saved to `avatar_url` column
4. Avatar displays everywhere user appears

### 8 Available Styles
1. **Avataaars** - Cartoon humans (default)
2. **Bottts** - Cute robots
3. **Identicon** - Geometric patterns
4. **Initials** - Letter-based
5. **Lorelei** - Artistic characters
6. **Micah** - Simple faces
7. **Personas** - Diverse styles
8. **Pixel Art** - Retro gaming

### Why This Approach?
- ✅ **FREE** - No storage costs
- ✅ **No API key** - Works immediately
- ✅ **Fast** - CDN-delivered SVG
- ✅ **Unique** - Seed-based generation
- ✅ **Professional** - High-quality designs
- ✅ **No uploads** - No complexity

---

## 🚀 Production Ready

All code is:
- ✅ TypeScript type-safe
- ✅ Build successful
- ✅ No linting errors (only warnings for `<img>` tags which are fine)
- ✅ Mobile responsive
- ✅ Accessible
- ✅ Animated

---

## 💾 Database Changes Required

**ONLY ONE**:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

That's all you need to do! 🎉

---

## 📞 Support

If you have issues:
1. Check column was added: `\d profiles` in psql
2. Verify SQL ran without errors
3. Refresh your app
4. Check browser console for errors

---

*Setup required: 1 SQL command*
*Time needed: < 1 minute*
*Cost: $0*

