import fetch from 'node-fetch';

export class TelegramClient {
  token: string;
  apiBase: string;

  constructor(token: string) {
    this.token = token;
    this.apiBase = `https://api.telegram.org/bot${this.token}`;
  }

  async sendMessage(chatId: number | string, text: string, options: any = {}) {
    const body = {
      chat_id: chatId,
      text,
      ...options,
    };

    const res = await fetch(`${this.apiBase}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Telegram sendMessage failed: ${res.status} ${txt}`);
    }

    return res.json();
  }
}
