// Script to set up Telegram webhook for Vercel deployment
// Run this once after deploying to set up the webhook

const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Your Vercel deployment URL + /api/bot

if (!BOT_TOKEN) {
  console.error('Missing TELEGRAM_BOT_TOKEN');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error('Missing WEBHOOK_URL (should be your Vercel URL + /api/bot)');
  process.exit(1);
}

async function setWebhook() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
  const data = JSON.stringify({
    url: WEBHOOK_URL,
    allowed_updates: ['message']
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.ok) {
            console.log('✅ Webhook set successfully!');
            console.log('Bot URL:', WEBHOOK_URL);
            resolve(result);
          } else {
            console.error('❌ Failed to set webhook:', result);
            reject(new Error(result.description));
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Run the setup
setWebhook().catch(console.error);
