import { NextRequest, NextResponse } from 'next/server';
import { handleUpdate } from '../../../../../bot/updateHandler';

// Validates Telegram webhook secret and forwards the update to the handler
export async function POST(req: NextRequest) {
  // Telegram will send the secret in this header when you set `secret_token` on setWebhook
  const officialHeader = req.headers.get('x-telegram-bot-api-secret-token');
  // legacy / custom header fallback
  const fallbackHeader = req.headers.get('x-telegram-secret');
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!expected || (officialHeader !== expected && fallbackHeader !== expected)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  await handleUpdate(body);
  return NextResponse.json({ ok: true });
}
