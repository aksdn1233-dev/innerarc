begin;

create extension if not exists pgcrypto;

create table if not exists public.pattern_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  version text not null default 'pattern-profile-1.0.0' check (char_length(version) between 1 and 100),
  generated_at timestamptz not null default now(),
  current_summary text not null default '' check (char_length(current_summary) <= 4000),
  dominant_patterns jsonb not null default '[]'::jsonb,
  uncertainty_metadata jsonb not null default '{}'::jsonb,
  source_systems text[] not null default '{}'::text[],
  last_recalculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pattern_hypotheses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid references public.pattern_profiles(id) on delete set null,
  source_system text not null check (source_system in ('saju','numerology','tarot','relationship','behavioral','user_reported','derived')),
  source_reference text not null check (char_length(source_reference) between 1 and 240),
  life_domain text not null check (life_domain in ('relationship','work','money','family','health_lifestyle','decision','education','move','growth','other')),
  hypothesis_type text not null check (char_length(hypothesis_type) between 1 and 100),
  hypothesis_text text not null check (char_length(hypothesis_text) between 1 and 1000),
  structured_tags jsonb not null default '[]'::jsonb,
  deterministic_basis jsonb,
  traditional_interpretation_basis jsonb,
  personalization_basis jsonb,
  provenance jsonb not null default '{}'::jsonb,
  initial_confidence numeric(4,3) not null default 0.450 check (initial_confidence between 0 and 1),
  current_confidence numeric(4,3) not null default 0.450 check (current_confidence between 0 and 1),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  support_count integer not null default 0 check (support_count >= 0),
  contradiction_count integer not null default 0 check (contradiction_count >= 0),
  ambiguous_count integer not null default 0 check (ambiguous_count >= 0),
  uncertainty_count integer not null default 0 check (uncertainty_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, source_system, source_reference)
);

create table if not exists public.pattern_reality_checks (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  hypothesis_id uuid not null references public.pattern_hypotheses(id) on delete cascade,
  client_request_id text not null check (client_request_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'),
  response text not null check (response in ('MATCH','PARTIAL','MISMATCH','CONTEXT_DEPENDENT')),
  note text check (note is null or char_length(note) <= 500),
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, client_request_id)
);

create table if not exists public.evidence_events (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  client_request_id text not null check (client_request_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'),
  event_type text not null check (char_length(event_type) between 1 and 80),
  life_domain text not null check (life_domain in ('relationship','work','money','family','health_lifestyle','decision','education','move','growth','other')),
  event_date date not null,
  approximate_date boolean not null default false,
  short_description text not null check (char_length(short_description) between 1 and 500),
  relationship_context text check (relationship_context is null or char_length(relationship_context) <= 200),
  outcome text not null default 'unresolved' check (outcome in ('positive','negative','mixed','neutral','unresolved')),
  user_confirmed boolean not null default true,
  source text not null default 'user_reported' check (source in ('user_reported','imported','derived')),
  subject text not null default 'owner' check (subject in ('owner','third_party')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, client_request_id)
);

create table if not exists public.evidence_hypothesis_links (
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  evidence_id uuid not null references public.evidence_events(id) on delete cascade,
  hypothesis_id uuid not null references public.pattern_hypotheses(id) on delete cascade,
  relation text not null check (relation in ('SUPPORT','CONTRADICT','AMBIGUOUS')),
  created_at timestamptz not null default now(),
  primary key (evidence_id, hypothesis_id)
);

create table if not exists public.confidence_revisions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  hypothesis_id uuid not null references public.pattern_hypotheses(id) on delete cascade,
  previous_confidence numeric(4,3) not null check (previous_confidence between 0 and 1),
  new_confidence numeric(4,3) not null check (new_confidence between 0 and 1),
  reason text not null check (char_length(reason) between 1 and 160),
  triggering_evidence_id uuid references public.evidence_events(id) on delete set null,
  triggering_reality_check_id uuid references public.pattern_reality_checks(id) on delete set null,
  created_at timestamptz not null default now(),
  check ((triggering_evidence_id is null) <> (triggering_reality_check_id is null))
);

create table if not exists public.pattern_graph_edges (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  source_node_type text not null check (source_node_type in ('hypothesis','reality_check','evidence','outcome','relationship_context','time')),
  source_node_id uuid not null,
  target_node_type text not null check (target_node_type in ('hypothesis','reality_check','evidence','outcome','relationship_context','time')),
  target_node_id uuid not null,
  relationship_type text not null check (char_length(relationship_type) between 1 and 80),
  context jsonb not null default '{}'::jsonb,
  observed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (owner_user_id, source_node_type, source_node_id, target_node_type, target_node_id, relationship_type)
);

create table if not exists public.report_provenance (
  provenance_id text primary key check (provenance_id ~ '^prv_[a-f0-9]{24}$'),
  owner_user_id uuid references auth.users(id) on delete cascade,
  order_id text not null check (char_length(order_id) between 6 and 64),
  content_fingerprint text not null check (content_fingerprint ~ '^fp_[a-f0-9]{24}$'),
  version text not null check (char_length(version) between 1 and 100),
  created_at timestamptz not null default now(),
  unique (order_id, provenance_id)
);

create table if not exists public.export_provenance (
  export_id text primary key check (export_id ~ '^exp_[a-f0-9]{32}$'),
  provenance_id text references public.report_provenance(provenance_id) on delete set null,
  owner_user_id uuid references auth.users(id) on delete cascade,
  order_id text,
  export_type text not null check (export_type in ('report_html','account_json','device_json')),
  content_fingerprint text not null check (content_fingerprint ~ '^fp_[a-f0-9]{24}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.security_rate_limit_buckets (
  scope_hash text not null check (scope_hash ~ '^(account|ip)_[a-f0-9]{32}$'),
  endpoint text not null check (endpoint ~ '^[a-z0-9_:-]{1,100}$'),
  bucket_start timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  updated_at timestamptz not null default now(),
  primary key (scope_hash, endpoint, bucket_start)
);

create table if not exists public.security_abuse_events (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid,
  event_type text not null check (char_length(event_type) between 1 and 100),
  account_ref text check (account_ref is null or account_ref ~ '^account_[a-f0-9]{32}$'),
  ip_ref text check (ip_ref is null or ip_ref ~ '^ip_[a-f0-9]{32}$'),
  endpoint text not null check (char_length(endpoint) between 1 and 120),
  resource_type text,
  resource_provenance_id text,
  request_count integer not null default 1 check (request_count > 0),
  user_agent_summary text check (user_agent_summary is null or char_length(user_agent_summary) <= 160),
  decision text not null check (decision in ('allow','challenge','deny','review')),
  created_at timestamptz not null default now()
);

create table if not exists public.security_incidents (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'open' check (status in ('open','contained','preserved','closed')),
  scope_summary text not null check (char_length(scope_summary) between 1 and 2000),
  evidence_manifest jsonb not null default '{}'::jsonb,
  preservation_hash text,
  opened_at timestamptz not null default now(),
  preserved_at timestamptz,
  closed_at timestamptz
);

alter table public.security_abuse_events
  add constraint security_abuse_events_incident_fk
  foreign key (incident_id) references public.security_incidents(id) on delete set null;

create index if not exists pattern_hypotheses_owner_updated_idx on public.pattern_hypotheses(owner_user_id, updated_at desc);
create index if not exists pattern_checks_owner_created_idx on public.pattern_reality_checks(owner_user_id, created_at desc);
create index if not exists evidence_events_owner_date_idx on public.evidence_events(owner_user_id, event_date desc);
create index if not exists confidence_revisions_hypothesis_created_idx on public.confidence_revisions(hypothesis_id, created_at desc);
create index if not exists pattern_graph_owner_created_idx on public.pattern_graph_edges(owner_user_id, created_at desc);
create index if not exists security_abuse_created_idx on public.security_abuse_events(created_at desc);

alter table public.pattern_profiles enable row level security;
alter table public.pattern_hypotheses enable row level security;
alter table public.pattern_reality_checks enable row level security;
alter table public.evidence_events enable row level security;
alter table public.evidence_hypothesis_links enable row level security;
alter table public.confidence_revisions enable row level security;
alter table public.pattern_graph_edges enable row level security;
alter table public.report_provenance enable row level security;
alter table public.export_provenance enable row level security;
alter table public.security_rate_limit_buckets enable row level security;
alter table public.security_abuse_events enable row level security;
alter table public.security_incidents enable row level security;

create policy "pattern_profiles_owner_select" on public.pattern_profiles for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy "pattern_hypotheses_owner_select" on public.pattern_hypotheses for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy "pattern_reality_checks_owner_select" on public.pattern_reality_checks for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy "evidence_events_owner_select" on public.evidence_events for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy "evidence_links_owner_select" on public.evidence_hypothesis_links for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy "confidence_revisions_owner_select" on public.confidence_revisions for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy "pattern_graph_edges_owner_select" on public.pattern_graph_edges for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy "report_provenance_owner_select" on public.report_provenance for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy "export_provenance_owner_select" on public.export_provenance for select to authenticated using ((select auth.uid()) = owner_user_id);

revoke all on table public.pattern_profiles, public.pattern_hypotheses, public.pattern_reality_checks,
  public.evidence_events, public.evidence_hypothesis_links, public.confidence_revisions,
  public.pattern_graph_edges, public.report_provenance, public.export_provenance,
  public.security_rate_limit_buckets, public.security_abuse_events, public.security_incidents
  from public, anon, authenticated;
grant select on table public.pattern_profiles, public.pattern_hypotheses, public.pattern_reality_checks,
  public.evidence_events, public.evidence_hypothesis_links, public.confidence_revisions,
  public.pattern_graph_edges, public.report_provenance, public.export_provenance
  to authenticated;
grant all on table public.pattern_profiles, public.pattern_hypotheses, public.pattern_reality_checks,
  public.evidence_events, public.evidence_hypothesis_links, public.confidence_revisions,
  public.pattern_graph_edges, public.report_provenance, public.export_provenance,
  public.security_rate_limit_buckets, public.security_abuse_events, public.security_incidents
  to service_role;

create or replace function public.record_pattern_reality_check(
  p_client_request_id text,
  p_source_system text,
  p_source_reference text,
  p_life_domain text,
  p_hypothesis_type text,
  p_hypothesis_text text,
  p_response text,
  p_note text,
  p_context jsonb,
  p_deterministic_basis jsonb,
  p_traditional_basis jsonb,
  p_personalization_basis jsonb,
  p_provenance jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_profile_id uuid;
  current_hypothesis_id uuid;
  current_check_id uuid;
  prior_confidence numeric(4,3);
  next_confidence numeric(4,3);
  prior_evidence_count integer;
  delta numeric(4,3);
  reason_code text;
begin
  if current_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_client_request_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$' then raise exception 'invalid request id' using errcode = '22023'; end if;
  if p_source_system not in ('saju','numerology','tarot','relationship','behavioral','user_reported','derived') then raise exception 'invalid source system' using errcode = '22023'; end if;
  if p_response not in ('MATCH','PARTIAL','MISMATCH','CONTEXT_DEPENDENT') then raise exception 'invalid response' using errcode = '22023'; end if;
  if char_length(p_source_reference) not between 1 and 240 or char_length(p_hypothesis_text) not between 1 and 1000 then raise exception 'invalid hypothesis' using errcode = '22023'; end if;

  select id into current_check_id from public.pattern_reality_checks
    where owner_user_id = current_user_id and client_request_id = p_client_request_id;
  if found then
    return jsonb_build_object('duplicate', true, 'realityCheckId', current_check_id);
  end if;

  insert into public.pattern_profiles(owner_user_id, source_systems)
    values (current_user_id, array[p_source_system])
    on conflict (owner_user_id) do update
      set source_systems = (select array(select distinct unnest(public.pattern_profiles.source_systems || excluded.source_systems))),
          updated_at = now()
    returning id into current_profile_id;

  insert into public.pattern_hypotheses(
    owner_user_id, profile_id, source_system, source_reference, life_domain,
    hypothesis_type, hypothesis_text, deterministic_basis,
    traditional_interpretation_basis, personalization_basis, provenance
  ) values (
    current_user_id, current_profile_id, p_source_system, p_source_reference, p_life_domain,
    p_hypothesis_type, p_hypothesis_text, p_deterministic_basis,
    p_traditional_basis, p_personalization_basis, p_provenance
  ) on conflict (owner_user_id, source_system, source_reference) do update
    set updated_at = now(), provenance = public.pattern_hypotheses.provenance || excluded.provenance
  returning id into current_hypothesis_id;

  select current_confidence, evidence_count into prior_confidence, prior_evidence_count
    from public.pattern_hypotheses
    where id = current_hypothesis_id and owner_user_id = current_user_id
    for update;

  delta := case p_response when 'MATCH' then 0.040 when 'PARTIAL' then 0.010 when 'MISMATCH' then -0.080 else 0 end;
  reason_code := case p_response
    when 'MATCH' then 'reality_check_match_small_increase'
    when 'PARTIAL' then 'reality_check_partial_very_small_increase'
    when 'MISMATCH' then 'reality_check_mismatch_decrease'
    else 'reality_check_context_increases_uncertainty' end;
  next_confidence := greatest(0.100, least(case when prior_evidence_count + 1 < 5 then 0.740 else 0.900 end, prior_confidence + delta));

  insert into public.pattern_reality_checks(owner_user_id, hypothesis_id, client_request_id, response, note, context)
    values (current_user_id, current_hypothesis_id, p_client_request_id, p_response, nullif(p_note, ''), coalesce(p_context, '{}'::jsonb))
    returning id into current_check_id;

  update public.pattern_hypotheses set
    current_confidence = next_confidence,
    evidence_count = evidence_count + 1,
    support_count = support_count + case when p_response in ('MATCH','PARTIAL') then 1 else 0 end,
    contradiction_count = contradiction_count + case when p_response = 'MISMATCH' then 1 else 0 end,
    ambiguous_count = ambiguous_count + case when p_response = 'CONTEXT_DEPENDENT' then 1 else 0 end,
    uncertainty_count = uncertainty_count + case when p_response = 'CONTEXT_DEPENDENT' then 1 else 0 end,
    updated_at = now()
    where id = current_hypothesis_id and owner_user_id = current_user_id;

  insert into public.confidence_revisions(owner_user_id, hypothesis_id, previous_confidence, new_confidence, reason, triggering_reality_check_id)
    values (current_user_id, current_hypothesis_id, prior_confidence, next_confidence, reason_code, current_check_id);
  insert into public.pattern_graph_edges(owner_user_id, source_node_type, source_node_id, target_node_type, target_node_id, relationship_type, context, observed_at)
    values (current_user_id, 'reality_check', current_check_id, 'hypothesis', current_hypothesis_id, lower(p_response), coalesce(p_context, '{}'::jsonb), now())
    on conflict do nothing;

  return jsonb_build_object(
    'duplicate', false,
    'hypothesisId', current_hypothesis_id,
    'realityCheckId', current_check_id,
    'previousConfidence', prior_confidence,
    'currentConfidence', next_confidence,
    'confidenceLabel', case when prior_evidence_count + 1 < 2 then '검증 중' when next_confidence < 0.4 then '낮음' when next_confidence < 0.7 then '보통' else '높음' end,
    'reason', reason_code
  );
end;
$$;

create or replace function public.record_pattern_evidence_event(
  p_client_request_id text,
  p_event_type text,
  p_life_domain text,
  p_event_date date,
  p_approximate_date boolean,
  p_short_description text,
  p_outcome text,
  p_relationship_context text,
  p_source_reference text,
  p_relation text,
  p_source_system text default null,
  p_hypothesis_text text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_event_id uuid;
  current_profile_id uuid;
  current_hypothesis_id uuid;
  prior_confidence numeric(4,3);
  next_confidence numeric(4,3);
  prior_evidence_count integer;
  delta numeric(4,3);
  reason_code text;
begin
  if current_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_client_request_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$' then raise exception 'invalid request id' using errcode = '22023'; end if;
  if p_outcome not in ('positive','negative','mixed','neutral','unresolved') then raise exception 'invalid outcome' using errcode = '22023'; end if;
  if char_length(p_short_description) not between 1 and 500 then raise exception 'invalid description' using errcode = '22023'; end if;
  if (p_source_reference is null) <> (p_relation is null) then raise exception 'incomplete hypothesis link' using errcode = '22023'; end if;
  if p_relation is not null and p_relation not in ('SUPPORT','CONTRADICT','AMBIGUOUS') then raise exception 'invalid relation' using errcode = '22023'; end if;

  select id into current_event_id from public.evidence_events
    where owner_user_id = current_user_id and client_request_id = p_client_request_id;
  if found then return jsonb_build_object('duplicate', true, 'evidenceId', current_event_id); end if;

  insert into public.evidence_events(
    owner_user_id, client_request_id, event_type, life_domain, event_date,
    approximate_date, short_description, relationship_context, outcome, user_confirmed, source
  ) values (
    current_user_id, p_client_request_id, p_event_type, p_life_domain, p_event_date,
    p_approximate_date, p_short_description, nullif(p_relationship_context, ''), p_outcome, true, 'user_reported'
  ) returning id into current_event_id;

  if p_source_reference is not null then
    if p_source_system is not null and p_hypothesis_text is not null then
      insert into public.pattern_profiles(owner_user_id, source_systems)
        values (current_user_id, array[p_source_system])
        on conflict (owner_user_id) do update set updated_at = now()
        returning id into current_profile_id;
      insert into public.pattern_hypotheses(
        owner_user_id, profile_id, source_system, source_reference, life_domain, hypothesis_type, hypothesis_text,
        provenance
      ) values (
        current_user_id, current_profile_id, p_source_system, p_source_reference, p_life_domain,
        'report_section', p_hypothesis_text, '{"userConfirmedEvidence":true}'::jsonb
      ) on conflict (owner_user_id, source_system, source_reference) do update set updated_at = now()
      returning id into current_hypothesis_id;
    else
      select id into current_hypothesis_id from public.pattern_hypotheses
        where owner_user_id = current_user_id and source_reference = p_source_reference;
    end if;
    if current_hypothesis_id is null then raise exception 'hypothesis not found' using errcode = 'P0002'; end if;

    select current_confidence, evidence_count into prior_confidence, prior_evidence_count
      from public.pattern_hypotheses where id = current_hypothesis_id and owner_user_id = current_user_id for update;
    delta := case p_relation when 'SUPPORT' then 0.060 when 'CONTRADICT' then -0.100 else 0 end;
    reason_code := case p_relation when 'SUPPORT' then 'confirmed_evidence_support_increase' when 'CONTRADICT' then 'confirmed_evidence_contradiction_decrease' else 'confirmed_evidence_ambiguous_uncertainty' end;
    next_confidence := greatest(0.100, least(case when prior_evidence_count + 1 < 5 then 0.740 else 0.900 end, prior_confidence + delta));

    insert into public.evidence_hypothesis_links(owner_user_id, evidence_id, hypothesis_id, relation)
      values (current_user_id, current_event_id, current_hypothesis_id, p_relation);
    update public.pattern_hypotheses set
      current_confidence = next_confidence,
      evidence_count = evidence_count + 1,
      support_count = support_count + case when p_relation = 'SUPPORT' then 1 else 0 end,
      contradiction_count = contradiction_count + case when p_relation = 'CONTRADICT' then 1 else 0 end,
      ambiguous_count = ambiguous_count + case when p_relation = 'AMBIGUOUS' then 1 else 0 end,
      uncertainty_count = uncertainty_count + case when p_relation = 'AMBIGUOUS' then 1 else 0 end,
      updated_at = now()
      where id = current_hypothesis_id and owner_user_id = current_user_id;
    insert into public.confidence_revisions(owner_user_id, hypothesis_id, previous_confidence, new_confidence, reason, triggering_evidence_id)
      values (current_user_id, current_hypothesis_id, prior_confidence, next_confidence, reason_code, current_event_id);
    insert into public.pattern_graph_edges(owner_user_id, source_node_type, source_node_id, target_node_type, target_node_id, relationship_type, context, observed_at)
      values (current_user_id, 'evidence', current_event_id, 'hypothesis', current_hypothesis_id, lower(p_relation), jsonb_build_object('outcome', p_outcome), p_event_date::timestamptz)
      on conflict do nothing;
  end if;

  return jsonb_build_object('duplicate', false, 'evidenceId', current_event_id, 'hypothesisId', current_hypothesis_id, 'currentConfidence', next_confidence, 'reason', reason_code);
end;
$$;

create or replace function public.consume_security_rate_limit(
  p_scope_hash text,
  p_endpoint text,
  p_window_seconds integer,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_bucket timestamptz;
  used integer;
begin
  if p_scope_hash !~ '^(account|ip)_[a-f0-9]{32}$' or p_endpoint !~ '^[a-z0-9_:-]{1,100}$' then raise exception 'invalid rate-limit key' using errcode = '22023'; end if;
  if p_window_seconds not between 10 and 86400 or p_limit not between 1 and 10000 then raise exception 'invalid rate-limit policy' using errcode = '22023'; end if;
  current_bucket := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.security_rate_limit_buckets(scope_hash, endpoint, bucket_start, request_count)
    values (p_scope_hash, p_endpoint, current_bucket, 1)
    on conflict (scope_hash, endpoint, bucket_start) do update
      set request_count = public.security_rate_limit_buckets.request_count + 1, updated_at = now()
    returning request_count into used;
  return used <= p_limit;
end;
$$;

revoke all on function public.record_pattern_reality_check(text,text,text,text,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb) from public, anon;
grant execute on function public.record_pattern_reality_check(text,text,text,text,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb) to authenticated, service_role;
revoke all on function public.record_pattern_evidence_event(text,text,text,date,boolean,text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.record_pattern_evidence_event(text,text,text,date,boolean,text,text,text,text,text,text,text) to authenticated, service_role;
revoke all on function public.consume_security_rate_limit(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_security_rate_limit(text,text,integer,integer) to service_role;

create or replace function public.delete_account_data(p_request_id text, p_scope text)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  existing_result jsonb;
  tarot_count integer := 0; reality_count integer := 0; consent_count integer := 0; profile_count integer := 0;
  preference_count integer := 0; notification_count integer := 0; survey_count integer := 0;
  pattern_count integer := 0; provenance_count integer := 0; completed_at timestamptz := now(); deletion_result jsonb;
begin
  if current_user_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_request_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$' then raise exception 'invalid request id' using errcode = '22023'; end if;
  if p_scope not in ('all_data','third_party') then raise exception 'invalid deletion scope' using errcode = '22023'; end if;
  select result into existing_result from public.data_rights_requests where owner_user_id = current_user_id and request_id = p_request_id and operation = 'delete' and scope = p_scope;
  if found then return existing_result || jsonb_build_object('duplicate', true); end if;
  if exists (select 1 from public.data_rights_requests where owner_user_id = current_user_id and request_id = p_request_id) then raise exception 'idempotency conflict' using errcode = '23505'; end if;

  if p_scope = 'third_party' then
    delete from public.evidence_events where owner_user_id = current_user_id and subject = 'third_party'; get diagnostics pattern_count = row_count;
    delete from public.tarot_readings where owner_user_id = current_user_id and subject = 'third_party'; get diagnostics tarot_count = row_count;
    delete from public.reality_checks where owner_user_id = current_user_id and subject = 'third_party'; get diagnostics reality_count = row_count;
  else
    select count(*) into pattern_count from public.pattern_hypotheses where owner_user_id = current_user_id;
    delete from public.export_provenance where owner_user_id = current_user_id; get diagnostics provenance_count = row_count;
    delete from public.report_provenance where owner_user_id = current_user_id;
    delete from public.pattern_profiles where owner_user_id = current_user_id;
    delete from public.report_acquisition_surveys where owner_user_id = current_user_id; get diagnostics survey_count = row_count;
    delete from public.daily_notification_deliveries where owner_user_id = current_user_id; get diagnostics notification_count = row_count;
    delete from public.notification_preferences where owner_user_id = current_user_id; get diagnostics preference_count = row_count;
    delete from public.tarot_readings where owner_user_id = current_user_id; get diagnostics tarot_count = row_count;
    delete from public.reality_checks where owner_user_id = current_user_id; get diagnostics reality_count = row_count;
    delete from public.consent_receipts where owner_user_id = current_user_id; get diagnostics consent_count = row_count;
    delete from public.profiles where owner_user_id = current_user_id; get diagnostics profile_count = row_count;
  end if;
  deletion_result := jsonb_build_object(
    'policyVersion','account-deletion-1.2.0','requestId',p_request_id,'scope',p_scope,'completedAt',completed_at,
    'deletedByCollection',jsonb_build_object('tarot_readings',tarot_count,'reality_checks',reality_count,'consent_receipts',consent_count,'profiles',profile_count,'notification_preferences',preference_count,'daily_notification_deliveries',notification_count,'report_acquisition_surveys',survey_count,'pattern_hypotheses',pattern_count,'provenance_records',provenance_count),
    'totalDeleted',tarot_count + reality_count + consent_count + profile_count + preference_count + notification_count + survey_count + pattern_count + provenance_count,
    'duplicate',false,'authIdentityRetained',true
  );
  insert into public.data_rights_requests(owner_user_id,request_id,operation,scope,completed_at,result) values(current_user_id,p_request_id,'delete',p_scope,completed_at,deletion_result);
  return deletion_result;
end;
$$;

revoke all on function public.delete_account_data(text,text) from public, anon;
grant execute on function public.delete_account_data(text,text) to authenticated, service_role;

commit;
