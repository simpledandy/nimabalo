-- Nimabalo baseline schema (reference)
--
-- Source: exported from current Supabase project.
-- This file is kept in-repo for onboarding and schema visibility.
--
-- NOTE:
-- - This is a baseline snapshot, not an ordered migration history.
-- - Use Supabase migrations for forward-only changes.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  title text not null check (char_length(title) >= 3 and char_length(title) <= 200),
  body text,
  created_at timestamptz default now(),
  same_count integer default 0
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id),
  user_id uuid not null references auth.users(id),
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  badge_type text not null,
  awarded_at timestamptz default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references public.profiles(id),
  referred_id uuid unique references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.stars (
  user_id uuid primary key references public.profiles(id),
  stars integer not null default 0
);

create table if not exists public.user_reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  question_id uuid not null references public.questions(id),
  reaction_type text not null default 'same_question',
  created_at timestamptz default now()
);
