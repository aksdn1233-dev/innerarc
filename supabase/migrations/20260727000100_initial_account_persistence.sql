begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  owner_user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null check (locale in ('ko', 'en')),
  time_zone text not null check (char_length(time_zone) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consent_receipts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  policy_version text not null check (char_length(policy_version) between 1 and 100),
  accepted_at timestamptz not null,
  privacy_required boolean not null check (privacy_required),
  ai_personalization boolean not null default false,
  model_training boolean not null default false,
  product_analytics boolean not null default false,
  marketing boolean not null default false,
  raw_journal_retention boolean not null default false,
  created_at timestamptz not null default now(),
  unique (owner_user_id, policy_version, accepted_at)
);

create table if not exists public.tarot_readings (
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (char_length(id) between 1 and 120),
  client_request_id text not null check (client_request_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'),
  category text not null check (category in ('work', 'love', 'money', 'relationship', 'emotion', 'daily_choice', 'free')),
  question text not null check (char_length(question) between 1 and 2000),
  history_version text not null,
  snapshot jsonb not null,
  subject text not null default 'owner' check (subject in ('owner', 'third_party')),
  created_at timestamptz not null,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (owner_user_id, id),
  unique (owner_user_id, client_request_id)
);

create table if not exists public.reality_checks (
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (char_length(id) between 1 and 120),
  client_request_id text not null check (client_request_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'),
  category text not null check (category in ('work', 'relationship', 'money', 'emotion', 'daily_choice', 'growth', 'other')),
  record jsonb not null,
  subject text not null default 'owner' check (subject in ('owner', 'third_party')),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  primary key (owner_user_id, id),
  unique (owner_user_id, client_request_id)
);

create table if not exists public.data_rights_requests (
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  request_id text not null check (request_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'),
  operation text not null check (operation in ('export', 'delete')),
  scope text not null check (scope in ('all_data', 'third_party')),
  completed_at timestamptz not null,
  result jsonb not null,
  primary key (owner_user_id, request_id)
);

create index if not exists tarot_readings_owner_created_idx
  on public.tarot_readings (owner_user_id, created_at desc)
  where deleted_at is null;

create index if not exists reality_checks_owner_created_idx
  on public.reality_checks (owner_user_id, created_at desc)
  where deleted_at is null;

create index if not exists consent_receipts_owner_created_idx
  on public.consent_receipts (owner_user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists tarot_readings_set_updated_at on public.tarot_readings;
create trigger tarot_readings_set_updated_at
before update on public.tarot_readings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.consent_receipts enable row level security;
alter table public.tarot_readings enable row level security;
alter table public.reality_checks enable row level security;
alter table public.data_rights_requests enable row level security;

create policy "profiles_owner_all" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);

create policy "consent_receipts_owner_all" on public.consent_receipts
  for all to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);

create policy "tarot_readings_owner_all" on public.tarot_readings
  for all to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);

create policy "reality_checks_owner_all" on public.reality_checks
  for all to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);

create policy "data_rights_requests_owner_all" on public.data_rights_requests
  for all to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);

revoke all on function public.set_updated_at() from public, anon;
grant execute on function public.set_updated_at() to authenticated, service_role;

commit;
