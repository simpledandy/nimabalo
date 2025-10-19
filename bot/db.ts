import { Pool } from 'pg';

let pool: Pool | null = null;

export const initDb = (connectionString: string) => {
  pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  return pool;
};

export const getPool = () => {
  if (!pool) throw new Error('DB not initialized');
  return pool;
};

export const ensureSchema = async () => {
  const p = getPool();
  await p.query(`
    create table if not exists tg_login_tokens (
      id bigserial primary key,
      token text unique not null,
      telegram_id bigint not null,
      telegram_username text,
      first_name text,
      last_name text,
      created_at timestamptz not null default now(),
      expires_at timestamptz not null,
      consumed_at timestamptz
    );
    create index if not exists idx_tg_login_tokens_token on tg_login_tokens(token);
    create index if not exists idx_tg_login_tokens_expires on tg_login_tokens(expires_at);

    create table if not exists tg_user_feedback (
      id bigserial primary key,
      telegram_id bigint not null,
      question_type text not null,
      answer text not null,
      created_at timestamptz not null default now()
    );
    create index if not exists idx_tg_user_feedback_telegram_id on tg_user_feedback(telegram_id);

    create table if not exists tg_feedback_messages (
      id bigserial primary key,
      telegram_id bigint not null,
      message_text text not null,
      message_type text not null default 'feedback',
      forwarded_to_admin boolean not null default false,
      admin_message_id bigint,
      created_at timestamptz not null default now()
    );
    create index if not exists idx_tg_feedback_messages_telegram_id on tg_feedback_messages(telegram_id);
    create index if not exists idx_tg_feedback_messages_forwarded on tg_feedback_messages(forwarded_to_admin);
  `);
};
