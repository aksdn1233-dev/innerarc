-- Additive residential-template persistence. Apply in staging before enabling the UI.
begin;

-- Internal, reviewed revisions. No client role can enumerate template definitions or provenance.
create table public.residential_template_revisions (
  template_id text not null check (template_id ~ '^[a-z0-9_-]{1,64}$'),
  version text not null check (version ~ '^\d+\.\d+\.\d+$'),
  structural_id text not null check (structural_id ~ '^[a-z0-9_-]{1,64}$'),
  definition jsonb not null check (jsonb_typeof(definition)='object' and octet_length(definition::text)<=200000),
  verification_level smallint not null check (verification_level between 0 and 4),
  provenance jsonb not null check (jsonb_typeof(provenance)='object' and octet_length(provenance::text)<=4000),
  status text not null default 'draft' check (status in ('draft','reviewed','retired')),
  created_at timestamptz not null default now(),
  primary key(template_id,version)
);

create table public.space_template_selections (
  project_id uuid primary key, owner_user_id uuid not null,
  template_id text not null check (template_id ~ '^[a-z0-9_-]{1,64}$'), template_version text not null check (template_version ~ '^\d+\.\d+\.\d+$'),
  variant text not null check (variant in ('standard','mirrored','balcony_expanded','mirrored_balcony_expanded')),
  match_score smallint not null check (match_score between 0 and 100),
  evidence_status text not null check (evidence_status in ('CONFIRMED','LIKELY','ESTIMATED','CONFLICT','UNKNOWN')),
  private_residence jsonb not null default '{}'::jsonb check (jsonb_typeof(private_residence)='object' and octet_length(private_residence::text)<=2000),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(project_id,owner_user_id) references public.space_projects(id,owner_user_id) on delete cascade
);

-- Corrections stay owner/project scoped. They can nominate a revision but never mutate a global template.
create table public.space_template_corrections (
  id uuid primary key default gen_random_uuid(), request_id uuid not null,
  project_id uuid not null, owner_user_id uuid not null,
  template_id text not null, template_version text not null,
  correction jsonb not null check (jsonb_typeof(correction)='object' and octet_length(correction::text)<=4000),
  review_status text not null default 'private' check (review_status in ('private','candidate','dismissed')),
  created_at timestamptz not null default now(),
  unique(owner_user_id,request_id),
  foreign key(project_id,owner_user_id) references public.space_projects(id,owner_user_id) on delete cascade
);

-- Aggregate candidates are internal review queues. Thresholds live in data, never application constants.
create table public.residential_template_engine_settings (
  key text primary key, value jsonb not null check (octet_length(value::text)<=1000), updated_at timestamptz not null default now()
);
insert into public.residential_template_engine_settings(key,value) values
  ('revision_candidate_thresholds','{"minimumDistinctProjects":5,"minimumVerificationLevel":2,"autoPromote":false}'::jsonb);
create table public.residential_template_revision_candidates (
  id uuid primary key default gen_random_uuid(), template_id text not null, base_version text not null,
  fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'), distinct_project_count integer not null default 0 check (distinct_project_count>=0),
  observed_summary jsonb not null default '{}'::jsonb check (octet_length(observed_summary::text)<=10000),
  status text not null default 'pending_review' check (status in ('pending_review','accepted','rejected')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(template_id,base_version,fingerprint)
);

do $$ declare t text; begin
  foreach t in array array['space_template_selections','space_template_corrections'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('create policy owner_select on public.%I for select to authenticated using ((select auth.uid())=owner_user_id)',t);
    execute format('revoke all on public.%I from public,anon,authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
    execute format('grant all on public.%I to service_role',t);
    execute format('create index %I on public.%I(owner_user_id)',t||'_owner_idx',t);
  end loop;
end $$;
alter table public.residential_template_revisions enable row level security;
alter table public.residential_template_engine_settings enable row level security;
alter table public.residential_template_revision_candidates enable row level security;
revoke all on public.residential_template_revisions,public.residential_template_engine_settings,public.residential_template_revision_candidates from public,anon,authenticated;
grant all on public.residential_template_revisions,public.residential_template_engine_settings,public.residential_template_revision_candidates to service_role;

create function public.space_save_template_selection(p_owner uuid,p_project uuid,p_selection jsonb)
returns void language plpgsql security definer set search_path='' as $$
begin
  perform 1 from public.space_projects where id=p_project and owner_user_id=p_owner for update;
  if not found then raise exception 'project unavailable' using errcode='42501'; end if;
  insert into public.space_template_selections(project_id,owner_user_id,template_id,template_version,variant,match_score,evidence_status,private_residence)
  values(p_project,p_owner,p_selection->>'templateId',p_selection->>'templateVersion',p_selection->>'variant',(p_selection->>'matchScore')::smallint,p_selection->>'evidenceStatus',p_selection->'privateResidence')
  on conflict(project_id) do update set template_id=excluded.template_id,template_version=excluded.template_version,variant=excluded.variant,match_score=excluded.match_score,evidence_status=excluded.evidence_status,private_residence=excluded.private_residence,updated_at=now();
end $$;
revoke all on function public.space_save_template_selection(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.space_save_template_selection(uuid,uuid,jsonb) to service_role;

create function public.space_save_template_correction(p_owner uuid,p_project uuid,p_request uuid,p_template text,p_version text,p_correction jsonb)
returns void language plpgsql security definer set search_path='' as $$
begin
  perform 1 from public.space_projects where id=p_project and owner_user_id=p_owner for update;
  if not found then raise exception 'project unavailable' using errcode='42501'; end if;
  insert into public.space_template_corrections(request_id,project_id,owner_user_id,template_id,template_version,correction)
  values(p_request,p_project,p_owner,p_template,p_version,p_correction) on conflict(owner_user_id,request_id) do nothing;
end $$;
revoke all on function public.space_save_template_correction(uuid,uuid,uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.space_save_template_correction(uuid,uuid,uuid,text,text,jsonb) to service_role;

commit;
