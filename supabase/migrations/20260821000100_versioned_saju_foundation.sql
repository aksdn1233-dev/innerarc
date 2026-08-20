begin;

-- Additive, inactive foundation for reusable Saju identities and immutable chart history.
-- No payment, entitlement, or existing profile row is changed. Apply only after staging
-- migration review. Rollback reference: drop the tables below in reverse dependency order;
-- because this migration owns only new tables, rollback cannot rewrite historical orders.

create table if not exists public.saju_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  relationship_type text not null check (relationship_type in (
    'self', 'partner', 'family', 'child', 'parent', 'friend', 'coworker', 'other'
  )),
  recorded_sex text not null check (recorded_sex in ('female', 'male')),
  calendar_type text not null check (calendar_type in ('gregorian', 'lunar')),
  birth_date date not null,
  birth_time time,
  birth_time_known boolean not null,
  leap_month boolean not null default false,
  timezone text not null default 'Asia/Seoul' check (char_length(timezone) between 1 and 100),
  longitude_degrees numeric(7,4),
  privacy_settings jsonb not null default '{}'::jsonb,
  consent_version text not null check (char_length(consent_version) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (birth_time_known = (birth_time is not null)),
  check (calendar_type = 'lunar' or leap_month = false)
);

create table if not exists public.saju_charts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.saju_profiles(id) on delete cascade,
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, profile_id)
);

create table if not exists public.saju_chart_versions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  chart_id uuid not null references public.saju_charts(id) on delete cascade,
  supersedes_version_id uuid references public.saju_chart_versions(id),
  engine_version text not null,
  calculation_policy_version text not null,
  interpretation_rule_version text not null,
  ai_prompt_version text not null,
  model_version text not null,
  calculation_policy jsonb not null,
  canonical_result jsonb not null,
  canonical_diff jsonb,
  status text not null default 'active' check (status in ('candidate', 'active', 'superseded', 'rejected')),
  invalidates_generated_content boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  check (jsonb_typeof(canonical_result) = 'object'),
  check (jsonb_typeof(calculation_policy) = 'object')
);

alter table public.saju_charts
  add constraint saju_charts_current_version_fk
  foreign key (current_version_id) references public.saju_chart_versions(id);

create table if not exists public.saju_interpretations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  chart_version_id uuid not null references public.saju_chart_versions(id) on delete restrict,
  topic text not null check (topic in ('core', 'wealth', 'work', 'relationship', 'timing', 'compatibility')),
  supporting_rule_ids text[] not null default '{}',
  structured_facts jsonb not null,
  rendered_content jsonb not null,
  interpretation_rule_version text not null,
  ai_prompt_version text not null,
  model_version text not null,
  status text not null default 'valid' check (status in ('valid', 'invalidated', 'failed_validation')),
  invalidated_at timestamptz,
  invalidation_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.saju_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  chart_version_id uuid not null references public.saju_chart_versions(id) on delete restrict,
  purchase_order_id text references public.payment_orders(order_id),
  idempotency_key text not null check (char_length(idempotency_key) between 8 and 160),
  state text not null default 'QUEUED' check (state in (
    'QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED_RETRYABLE', 'FAILED_FINAL', 'REFUND_PENDING', 'REFUNDED'
  )),
  attempt_count integer not null default 0 check (attempt_count between 0 and 20),
  failure_code text,
  failure_evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, idempotency_key)
);

create table if not exists public.ai_cost_events (
  id bigint generated always as identity primary key,
  owner_user_id uuid references auth.users(id) on delete set null,
  request_id text not null,
  feature text not null,
  product_code text,
  model text not null,
  input_tokens integer not null check (input_tokens >= 0),
  output_tokens integer not null check (output_tokens >= 0),
  estimated_cost_micros bigint not null check (estimated_cost_micros >= 0),
  latency_ms integer not null check (latency_ms >= 0),
  cache_status text not null check (cache_status in ('hit', 'miss', 'bypass')),
  created_at timestamptz not null default now(),
  unique (request_id)
);

create table if not exists public.saju_recalculation_audit (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  chart_id uuid not null references public.saju_charts(id) on delete cascade,
  old_version_id uuid not null references public.saju_chart_versions(id) on delete restrict,
  new_version_id uuid not null references public.saju_chart_versions(id) on delete restrict,
  canonical_diff jsonb not null,
  affected_interpretation_ids uuid[] not null default '{}',
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (chart_id, old_version_id, new_version_id)
);

create index if not exists saju_profiles_owner_active_idx
  on public.saju_profiles (owner_user_id, created_at desc) where deleted_at is null;
create index if not exists saju_chart_versions_chart_created_idx
  on public.saju_chart_versions (chart_id, created_at desc);
create index if not exists saju_interpretations_owner_created_idx
  on public.saju_interpretations (owner_user_id, created_at desc);
create index if not exists saju_generation_jobs_state_idx
  on public.saju_generation_jobs (state, created_at);
create index if not exists ai_cost_events_feature_created_idx
  on public.ai_cost_events (feature, created_at desc);

alter table public.saju_profiles enable row level security;
alter table public.saju_charts enable row level security;
alter table public.saju_chart_versions enable row level security;
alter table public.saju_interpretations enable row level security;
alter table public.saju_generation_jobs enable row level security;
alter table public.ai_cost_events enable row level security;
alter table public.saju_recalculation_audit enable row level security;

create policy "saju_profiles_owner_all" on public.saju_profiles
  for all to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);

create policy "saju_charts_owner_select" on public.saju_charts
  for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy "saju_chart_versions_owner_select" on public.saju_chart_versions
  for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy "saju_interpretations_owner_select" on public.saju_interpretations
  for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy "saju_generation_jobs_owner_select" on public.saju_generation_jobs
  for select to authenticated using ((select auth.uid()) = owner_user_id);

revoke all on table public.saju_profiles from public, anon;
grant select, insert, update, delete on table public.saju_profiles to authenticated;
grant select on table public.saju_charts, public.saju_chart_versions,
  public.saju_interpretations, public.saju_generation_jobs to authenticated;

revoke all on table public.ai_cost_events, public.saju_recalculation_audit
  from public, anon, authenticated;
grant all on table public.saju_profiles, public.saju_charts, public.saju_chart_versions,
  public.saju_interpretations, public.saju_generation_jobs, public.ai_cost_events,
  public.saju_recalculation_audit to service_role;

drop trigger if exists saju_profiles_set_updated_at on public.saju_profiles;
create trigger saju_profiles_set_updated_at before update on public.saju_profiles
for each row execute function public.set_updated_at();
drop trigger if exists saju_charts_set_updated_at on public.saju_charts;
create trigger saju_charts_set_updated_at before update on public.saju_charts
for each row execute function public.set_updated_at();
drop trigger if exists saju_generation_jobs_set_updated_at on public.saju_generation_jobs;
create trigger saju_generation_jobs_set_updated_at before update on public.saju_generation_jobs
for each row execute function public.set_updated_at();

commit;

-- Manual rollback reference (staging only; reverse dependency order):
-- begin;
-- drop table public.saju_recalculation_audit, public.ai_cost_events,
--   public.saju_generation_jobs, public.saju_interpretations;
-- alter table public.saju_charts drop constraint saju_charts_current_version_fk;
-- drop table public.saju_chart_versions, public.saju_charts, public.saju_profiles;
-- commit;
