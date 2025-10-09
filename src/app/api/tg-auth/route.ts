import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { ErrorType, createError, processError, handleError } from '@/lib/errorHandling';

// Env: DATABASE_URL, NEXT_PUBLIC_SITE_URL

// Lazy-load database pool to prevent connection issues
let pool: Pool | null = null;
function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured');
    }
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL, 
      ssl: { rejectUnauthorized: false },
      max: 5, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
  }
  return pool;
}

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

  const dbPool = getPool();
  
  try {
    return await handleError(async () => {
      console.log('Processing telegram auth for token:', tgToken.substring(0, 8) + '...');
      
      // 1) Validate token with enhanced error handling
      let tokenRow;
      try {
        const { rows } = await dbPool.query(
          `SELECT * FROM tg_login_tokens 
           WHERE token = $1 
           AND consumed_at IS NULL 
           AND expires_at > NOW() 
           LIMIT 1`,
          [tgToken]
        );
        
        if (!rows.length) {
          console.log('Token not found or expired');
          return NextResponse.redirect(`${siteUrl}/auth?error=token_expired&message=${encodeURIComponent('Token expired or already used')}`);
        }
        
        tokenRow = rows[0];
        console.log('Token validated for telegram_id:', tokenRow.telegram_id);
      } catch (dbErr) {
        console.error('Database query error:', dbErr);
        throw createError(
          ErrorType.DATABASE_ERROR,
          'Database query failed',
          'Ma\'lumotlar bazasi bilan bog\'lanishda xatolik',
          { action: 'validate_token', metadata: { error: dbErr } }
        );
      }

      const admin = getSupabaseAdmin();
      console.log('Supabase admin client initialized');

      // 2) Find or create a user: we will use a synthetic email based on telegram id
      const telegramId = String(tokenRow.telegram_id);
      const email = `tg_${telegramId}@nimabalo.local`; // never emailed

      // Ensure user exists (find or create)
      let userId: string | null = null;

      // First, try to find existing user by email
      try {
        const { data: users, error: getUserErr } = await admin.auth.admin.listUsers();
        
        if (getUserErr) {
          throw getUserErr;
        }

        // Find user with matching email
        const found = users?.users?.find(u => 
          (u.email || '').toLowerCase() === email.toLowerCase()
        );
        
        if (found) {
          userId = found.id;
          console.log('Found existing user:', found.id);
        }
      } catch (err) {
        console.error('Error finding user:', err);
        // Don't throw - we'll try to create the user instead
      }

      // If user not found, create new user
      if (!userId) {
        try {
          const fullName = [tokenRow.first_name, tokenRow.last_name]
            .filter(Boolean)
            .join(' ')
            .trim() || undefined;

          const { data: created, error: createErr } = await admin.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              auth_provider: 'telegram',
              telegram_id: telegramId,
              telegram_username: tokenRow.telegram_username || null,
              first_name: tokenRow.first_name || null,
              last_name: tokenRow.last_name || null,
              full_name: fullName,
            },
          });

          if (created?.user) {
            userId = created.user.id;
            console.log('✅ Created new user:', created.user.id);
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

      // 3) Generate magic link with session tokens
      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      try {
        // Try to generate session tokens via magic link
        const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
        });

        if (!linkErr && linkData?.properties?.action_link) {
          // Extract tokens from the magic link
          const linkUrl = new URL(linkData.properties.action_link);
          accessToken = linkUrl.searchParams.get('access_token');
          refreshToken = linkUrl.searchParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('✅ Generated session tokens via magic link');
          }
        }
      } catch (linkErr) {
        console.warn('Magic link generation failed, will try alternative method:', linkErr);
      }

      // Fallback: Try to create session using admin API (Supabase v2.39+)
      if (!accessToken || !refreshToken) {
        try {
          // @ts-expect-error - createSession may not be in types yet
          const sessionResponse = await admin.auth.admin.createSession?.({
            userId: userId,
          });

          if (sessionResponse && !sessionResponse.error && sessionResponse.data) {
            accessToken = sessionResponse.data.access_token;
            refreshToken = sessionResponse.data.refresh_token;
            console.log('✅ Created session via admin API');
          }
        } catch (sessionErr) {
          console.warn('Admin session creation not available:', sessionErr);
        }
      }

      // If both methods failed, we need a different approach - generate recovery link
      if (!accessToken || !refreshToken) {
        console.log('Using recovery link fallback method');
        const { data: recoveryData, error: recoveryErr } = await admin.auth.admin.generateLink({
          type: 'recovery',
          email: email,
        });

        if (recoveryErr || !recoveryData?.properties?.action_link) {
          console.error('Recovery link generation failed:', recoveryErr);
          throw createError(
            ErrorType.SUPABASE_ERROR,
            'Failed to generate authentication link',
            'Autentifikatsiya havolasini yaratib bo\'lmadi',
            { action: 'generate_auth_link', userId, metadata: { error: recoveryErr } }
          );
        }

        console.log('Recovery link generated:', recoveryData.properties.action_link);

        // Extract tokens from recovery link - check both query params and hash
        const linkUrl = new URL(recoveryData.properties.action_link);
        accessToken = linkUrl.searchParams.get('access_token');
        refreshToken = linkUrl.searchParams.get('refresh_token');

        // If not in query params, check hash (format: #access_token=...&refresh_token=...)
        if (!accessToken || !refreshToken) {
          const hash = linkUrl.hash.substring(1); // Remove the # symbol
          const hashParams = new URLSearchParams(hash);
          accessToken = accessToken || hashParams.get('access_token');
          refreshToken = refreshToken || hashParams.get('refresh_token');
          console.log('Tokens found in hash:', !!accessToken, !!refreshToken);
        }

        if (!accessToken || !refreshToken) {
          console.error('Failed to extract tokens from link:', {
            hasSearchParams: linkUrl.searchParams.toString(),
            hasHash: linkUrl.hash,
            linkUrl: recoveryData.properties.action_link
          });
          throw createError(
            ErrorType.SUPABASE_ERROR,
            'No session tokens in response',
            'Sessiya tokenlari topilmadi',
            { action: 'extract_tokens', userId }
          );
        }

        console.log('✅ Generated session via recovery link');
      }

      // 4) Mark token as consumed
      await dbPool.query(
        `UPDATE tg_login_tokens 
         SET consumed_at = NOW() 
         WHERE token = $1`,
        [tgToken]
      );

      console.log('✅ Telegram authentication successful for user:', userId);

      // 5) Redirect with session tokens
      return NextResponse.redirect(
        `${siteUrl}/auth?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}`
      );
    }, { action: 'telegram_auth', telegramId: tgToken.substring(0, 8) }, 2);
  } catch (err) {
    console.error('Unexpected error in tg-auth:', err);
    const processedError = processError(err, { action: 'telegram_auth' });
    return NextResponse.redirect(`${siteUrl}/auth?error=unexpected&message=${encodeURIComponent(processedError.userMessage)}`);
  }
}


