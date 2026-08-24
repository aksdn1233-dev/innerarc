begin;

alter table public.notification_preferences
  add column if not exists daily_flow_enabled boolean not null default false,
  add column if not exists daily_notification_consent_at timestamptz,
  add column if not exists daily_birth_month smallint,
  add column if not exists daily_birth_day smallint,
  add column if not exists locale text not null default 'ko',
  add column if not exists time_zone text not null default 'Asia/Seoul',
  add column if not exists paid_auto_enable boolean not null default true;

alter table public.notification_preferences
  drop constraint if exists notification_preferences_daily_birth_month_check,
  add constraint notification_preferences_daily_birth_month_check
    check (daily_birth_month is null or daily_birth_month between 1 and 12),
  drop constraint if exists notification_preferences_daily_birth_day_check,
  add constraint notification_preferences_daily_birth_day_check
    check (daily_birth_day is null or daily_birth_day between 1 and 31),
  drop constraint if exists notification_preferences_locale_check,
  add constraint notification_preferences_locale_check check (locale in ('ko', 'en')),
  drop constraint if exists notification_preferences_daily_consent_check,
  add constraint notification_preferences_daily_consent_check check (
    not daily_flow_enabled
    or (
      daily_notification_consent_at is not null
      and daily_birth_month is not null
      and daily_birth_day is not null
      and in_app_enabled
    )
  );

create table if not exists public.daily_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  delivery_date date not null,
  scheduled_for timestamptz not null,
  notification_type text not null default 'daily_flow' check (notification_type = 'daily_flow'),
  locale text not null check (locale in ('ko', 'en')),
  title text not null check (char_length(title) between 1 and 160),
  summary text not null check (char_length(summary) between 1 and 500),
  action_text text not null check (char_length(action_text) between 1 and 500),
  caution_text text not null check (char_length(caution_text) between 1 and 500),
  question_text text not null check (char_length(question_text) between 1 and 500),
  rule_version text not null check (char_length(rule_version) between 1 and 100),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (owner_user_id, delivery_date, notification_type)
);

create index if not exists daily_notification_deliveries_owner_date_idx
  on public.daily_notification_deliveries (owner_user_id, delivery_date desc);

alter table public.daily_notification_deliveries enable row level security;
create policy "daily_notification_deliveries_owner_select" on public.daily_notification_deliveries
  for select to authenticated
  using ((select auth.uid()) = owner_user_id);
create policy "daily_notification_deliveries_owner_update" on public.daily_notification_deliveries
  for update to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);
revoke all on table public.daily_notification_deliveries from public, anon;
grant select, update on table public.daily_notification_deliveries to authenticated;
grant all on table public.daily_notification_deliveries to service_role;

create table if not exists public.report_acquisition_surveys (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique references public.payment_orders(order_id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete cascade,
  source text not null check (source in (
    'naver_search', 'google_search', 'instagram', 'youtube', 'other_sns',
    'online_ad', 'friend', 'community', 'other'
  )),
  detail text not null default '' check (char_length(detail) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists report_acquisition_surveys_source_created_idx
  on public.report_acquisition_surveys (source, created_at desc);
alter table public.report_acquisition_surveys enable row level security;
create policy "report_acquisition_surveys_owner_delete" on public.report_acquisition_surveys
  for delete to authenticated
  using (owner_user_id is not null and (select auth.uid()) = owner_user_id);
revoke all on table public.report_acquisition_surveys from public, anon, authenticated;
grant delete on table public.report_acquisition_surveys to authenticated;
grant all on table public.report_acquisition_surveys to service_role;

create or replace function public.enable_paid_daily_notifications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'DONE'
    and old.status is distinct from 'DONE'
    and new.owner_user_id is not null then
    update public.notification_preferences
    set daily_flow_enabled = true, in_app_enabled = true, updated_at = now()
    where owner_user_id = new.owner_user_id
      and daily_notification_consent_at is not null
      and daily_birth_month is not null
      and daily_birth_day is not null
      and paid_auto_enable;
  end if;
  return new;
end;
$$;

drop trigger if exists payment_orders_enable_paid_daily_notifications on public.payment_orders;
create trigger payment_orders_enable_paid_daily_notifications
after update of status on public.payment_orders
for each row execute function public.enable_paid_daily_notifications();

revoke all on function public.enable_paid_daily_notifications() from public, anon, authenticated;
grant execute on function public.enable_paid_daily_notifications() to service_role;

create or replace function public.delete_account_data(
  p_request_id text,
  p_scope text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  existing_result jsonb;
  tarot_count integer := 0;
  reality_count integer := 0;
  consent_count integer := 0;
  profile_count integer := 0;
  preference_count integer := 0;
  notification_count integer := 0;
  survey_count integer := 0;
  completed_at timestamptz := now();
  deletion_result jsonb;
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_request_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$' then
    raise exception 'invalid request id' using errcode = '22023';
  end if;
  if p_scope not in ('all_data', 'third_party') then
    raise exception 'invalid deletion scope' using errcode = '22023';
  end if;

  select result into existing_result
  from public.data_rights_requests
  where owner_user_id = current_user_id
    and request_id = p_request_id
    and operation = 'delete'
    and scope = p_scope;
  if found then return existing_result || jsonb_build_object('duplicate', true); end if;
  if exists (
    select 1 from public.data_rights_requests
    where owner_user_id = current_user_id and request_id = p_request_id
  ) then
    raise exception 'idempotency conflict' using errcode = '23505';
  end if;

  if p_scope = 'third_party' then
    delete from public.tarot_readings where owner_user_id = current_user_id and subject = 'third_party';
    get diagnostics tarot_count = row_count;
    delete from public.reality_checks where owner_user_id = current_user_id and subject = 'third_party';
    get diagnostics reality_count = row_count;
  else
    delete from public.report_acquisition_surveys where owner_user_id = current_user_id;
    get diagnostics survey_count = row_count;
    delete from public.daily_notification_deliveries where owner_user_id = current_user_id;
    get diagnostics notification_count = row_count;
    delete from public.notification_preferences where owner_user_id = current_user_id;
    get diagnostics preference_count = row_count;
    delete from public.tarot_readings where owner_user_id = current_user_id;
    get diagnostics tarot_count = row_count;
    delete from public.reality_checks where owner_user_id = current_user_id;
    get diagnostics reality_count = row_count;
    delete from public.consent_receipts where owner_user_id = current_user_id;
    get diagnostics consent_count = row_count;
    delete from public.profiles where owner_user_id = current_user_id;
    get diagnostics profile_count = row_count;
  end if;

  deletion_result := jsonb_build_object(
    'policyVersion', 'account-deletion-1.1.0',
    'requestId', p_request_id,
    'scope', p_scope,
    'completedAt', completed_at,
    'deletedByCollection', jsonb_build_object(
      'tarot_readings', tarot_count,
      'reality_checks', reality_count,
      'consent_receipts', consent_count,
      'profiles', profile_count,
      'notification_preferences', preference_count,
      'daily_notification_deliveries', notification_count,
      'report_acquisition_surveys', survey_count
    ),
    'totalDeleted', tarot_count + reality_count + consent_count + profile_count +
      preference_count + notification_count + survey_count,
    'duplicate', false,
    'authIdentityRetained', true
  );

  insert into public.data_rights_requests (
    owner_user_id, request_id, operation, scope, completed_at, result
  ) values (
    current_user_id, p_request_id, 'delete', p_scope, completed_at, deletion_result
  );
  return deletion_result;
end;
$$;

revoke all on function public.delete_account_data(text, text) from public, anon;
grant execute on function public.delete_account_data(text, text) to authenticated, service_role;

commit;
