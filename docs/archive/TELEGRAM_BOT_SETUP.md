# 🤖 Telegram Bot Setup Guide for BotFather

## Quick Setup Commands

### 1. Set Description
```
/setdescription @your_bot_username
```
Then paste:
```
🌟 Nimabaloga xush kelibsiz!

Nimabalo - bu O'zbekiston uchun maxsus savol-javob platformasi. Bu yerda siz:

✅ Istalgan mavzuda savol berishingiz
✅ Boshqa foydalanuvchilarga yordam berishingiz
✅ Bilim va tajriba almashishingiz
✅ Foydali javoblar topishingiz mumkin

🔐 Bu bot orqali Nimabalo platformasiga kirish, savol berish va javob yozish mumkin.

Bugundan boshlab bilim jamoamizga qo'shiling!
```

---

### 2. Set About Text
```
/setabouttext @your_bot_username
```
Then paste:
```
Nimabalo - O'zbekiston uchun savol-javob platformasi. Savollar bering, javoblar oling, bilim almashing! 🇺🇿
```

---

### 3. Set Commands
```
/setcommands @your_bot_username
```
Then paste:
```
start - Botni ishga tushirish va xush kelibsiz xabari
login - Nimabalo platformasiga kirish
help - Yordam va bot haqida ma'lumot
feedback - Fikr bildirish va taklif yuborish
```

---

### 4. Set Bot Picture
```
/setuserpic @your_bot_username
```
Then upload your logo:
- **File**: `public/logo.svg` (convert to PNG if needed)
- **Recommended size**: 512x512px or 640x360px
- **Format**: PNG or JPG
- **Tip**: Use your main Nimabalo logo for brand consistency

---

### 5. Set Privacy Policy
```
/setprivacy @your_bot_username
```

**Short version for bot (if BotFather asks):**
```
Nimabalo Maxfiylik Siyosati

Biz faqat zarur ma'lumotlarni to'playmiz:
• Telegram ID va username
• Ismingiz (agar kiritgan bo'lsangiz)
• Platformadagi faoliyatingiz

Ma'lumotlaringiz:
✅ Shifrlangan tarzda saqlanadi
✅ Uchinchi shaxslarga berilmaydi
✅ Faqat xizmat ko'rsatish uchun ishlatiladi

To'liq versiya: https://nimabalo.uz/privacy

Savollar bo'lsa: @nimabalo_support
```

**Full privacy policy is now live at:**
📄 **https://nimabalo.uz/privacy**

---

## ✅ Setup Checklist

After configuring in BotFather:

- [ ] Description set
- [ ] About text set
- [ ] Commands configured
- [ ] Bot picture uploaded
- [ ] Privacy settings configured
- [ ] Test `/start` command works
- [ ] Test `/login` command works
- [ ] Test `/help` command works
- [ ] Test `/feedback` command works
- [ ] Verify bot responds correctly
- [ ] Check login flow from bot to website

---

## 🔗 Important Links

- **Privacy Policy**: https://nimabalo.uz/privacy
- **Website**: https://nimabalo.uz
- **Questions**: https://nimabalo.uz/questions
- **Auth Page**: https://nimabalo.uz/auth

---

## 📝 Additional Settings (Optional)

### Set Bot Username (if needed)
```
/setusername
```

### Set Inline Mode (future feature)
```
/setinline
```

### Set Join Groups Settings
```
/setjoingroups
```
Recommendation: **Disable** (bot is for personal use)

### Set Privacy Mode
```
/setprivacy
```
Recommendation: **Disable** (so bot can see all messages in groups if added)

---

## 🎨 Bot Picture Tips

Your logo (`public/logo.svg`) should work great! If you need to convert:

### Option 1: Online Converter
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `public/logo.svg`
3. Set size to 512x512px
4. Download and upload to BotFather

### Option 2: Using Design Tools
- Figma: Export as PNG at 512x512px
- Photoshop: Save for Web (PNG, 512x512px)
- Any SVG viewer: Export/Screenshot at high resolution

---

## 🧪 Testing Your Bot

After setup:

1. **Search for your bot** in Telegram
2. **Send `/start`** - Should show welcome message
3. **Send `/help`** - Should show help information
4. **Send `/login`** - Should provide login button
5. **Click login button** - Should generate token and send link
6. **Click link** - Should open website and log you in
7. **Check profile** - Should be created automatically

---

## 🚨 Troubleshooting

### Bot doesn't respond
- Check bot is running on Render
- Verify `TELEGRAM_BOT_TOKEN` is set correctly
- Check Render logs for errors

### Login doesn't work
- Verify `SITE_URL` in Render matches your domain
- Check `DATABASE_URL` is same in Render and Vercel
- Verify database has `tg_login_tokens` table

### Commands don't appear in menu
- Make sure you set commands using `/setcommands`
- Restart Telegram app
- Clear cache and try again

---

## 📞 Support Contacts

Set these up for your users:

- **Support Email**: support@nimabalo.uz
- **Support Telegram**: @nimabalo_support (create this channel/bot)
- **Website Contact**: Link to a contact form or support page

---

## 🎯 Next Steps

1. ✅ Configure bot in BotFather (use commands above)
2. ✅ Privacy policy is live at https://nimabalo.uz/privacy
3. ✅ Test all bot commands
4. ✅ Verify login flow works end-to-end
5. ✅ Monitor bot logs for first 24 hours
6. ✅ Collect user feedback

---

**Last Updated**: October 8, 2025
**Status**: Ready for Production Use

**Your authentication is secure and privacy policy is live! 🚀**
