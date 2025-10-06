import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { customAlphabet } from 'nanoid';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { ErrorType, createError, processError, handleError } from '@/lib/errorHandling';

// Env: DATABASE_URL, NEXT_PUBLIC_SITE_URL

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tgToken = url.searchParams.get('tg_token');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!tgToken) {
    return NextResponse.redirect(`${siteUrl}/auth?error=invalid_token&message=${encodeURIComponent('Token not provided')}`);
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(`${siteUrl}/auth?error=server_config&message=${encodeURIComponent('Server configuration error')}`);
  }

  try {
    return await handleError(async () => {
      console.log('Processing telegram auth for token:', tgToken.substring(0, 8) + '...');
      
      // 1) Validate token with enhanced error handling
      const { rows } = await pool.query(
        `select * from tg_login_tokens where token = $1 and consumed_at is null and expires_at > now() limit 1`,
        [tgToken]
      );
      
      if (!rows.length) {
        console.log('Token not found or expired');
        return NextResponse.redirect(`${siteUrl}/auth?error=token_expired&message=${encodeURIComponent('Token expired or already used')}`);
      }
      
      const tokenRow = rows[0];
      console.log('Token validated for telegram_id:', tokenRow.telegram_id);

      const admin = getSupabaseAdmin();
      console.log('Supabase admin client initialized');

      // 2) Find or create a user: we will use a synthetic email based on telegram id
      const telegramId = String(tokenRow.telegram_id);
      const email = `tg_${telegramId}@nimabalo.local`; // never emailed

      // Ensure user exists (find or create)
      let userId: string | null = null;

      // First, try to find existing user by email
      try {
        const { data: usersPage, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (!listErr && usersPage?.users) {
          const found = usersPage.users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
          if (found) {
            userId = found.id;
            console.log('Found existing user:', found.id);
          }
        }
      } catch (err) {
        console.error('Error finding user:', err);
        throw createError(
          ErrorType.SUPABASE_ERROR,
          'Failed to find user',
          'Foydalanuvchini topishda muammo',
          { action: 'find_user', telegramId }
        );
      }

      // If user not found, create new user
      if (!userId) {
        try {
          const { data: created, error: createErr } = await admin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              auth_provider: 'telegram',
              telegram_id: telegramId,
              telegram_username: tokenRow.telegram_username || null,
              first_name: tokenRow.first_name || null,
              last_name: tokenRow.last_name || null,
            },
          });

          if (created?.user) {
            userId = created.user.id;
            console.log('Created new user:', created.user.id);
          } else if (createErr) {
            console.error('Error creating user:', createErr);
            throw createError(
              ErrorType.SUPABASE_ERROR,
              'Failed to create user',
              'Foydalanuvchi yaratishda muammo',
              { action: 'create_user', telegramId, metadata: { error: createErr } }
            );
          }
        } catch (err) {
          console.error('Error in user creation:', err);
          throw createError(
            ErrorType.SUPABASE_ERROR,
            'User creation failed',
            'Foydalanuvchi yaratishda muammo',
            { action: 'create_user', telegramId, metadata: { originalError: err } }
          );
        }
      }

      if (!userId) {
        throw createError(
          ErrorType.AUTH_USER_NOT_FOUND,
          'No user ID available',
          'Foydalanuvchi topilmadi',
          { action: 'user_validation', telegramId }
        );
      }

      // 3) Set a short-lived one-time password and redirect with creds for client sign-in
      const nano = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 32);
      const oneTimePassword = nano();
      const { error: pwErr } = await admin.auth.admin.updateUserById(userId, { password: oneTimePassword });
      if (pwErr) {
        throw createError(
          ErrorType.SUPABASE_ERROR,
          'Failed to set password',
          'Parol o\'rnatishda muammo',
          { action: 'set_password', userId, metadata: { error: pwErr } }
        );
      }

      // 4) Mark token consumed
      await pool.query(`update tg_login_tokens set consumed_at = now() where token = $1`, [tgToken]);

      // 5) Redirect to /auth to sign in client-side using one-time credentials
      const e = encodeURIComponent(email);
      const p = encodeURIComponent(oneTimePassword);
      return NextResponse.redirect(`${siteUrl}/auth?tg_email=${e}&tg_pw=${p}`);
    }, { action: 'telegram_auth', telegramId: tgToken.substring(0, 8) }, 2);
  } catch (err) {
    console.error('Unexpected error in tg-auth:', err);
    const processedError = processError(err, { action: 'telegram_auth' });
    return NextResponse.redirect(`${siteUrl}/auth?error=unexpected&message=${encodeURIComponent(processedError.userMessage)}`);
  }
}


