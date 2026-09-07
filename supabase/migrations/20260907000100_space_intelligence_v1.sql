-- Additive, feature-off rollout. Apply after PPI P0 in staging first.
begin;

create table public.space_projects (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  goal text not null check (goal in ('rest','focus','balance')),
  locale text not null check (locale in ('ko','en')),
  created_at timestamptz not null default now(),
  unique(id,owner_user_id)
);
-- Room, orientation and SpatialObject are a single validated, versioned scene snapshot.
create table public.space_rooms (
  project_id uuid primary key,
  owner_user_id uuid not null,
  scene jsonb not null check (jsonb_typeof(scene)='object' and octet_length(scene::text) <= 64000),
  updated_at timestamptz not null default now(),
  foreign key(project_id,owner_user_id) references public.space_projects(id,owner_user_id) on delete cascade
);
create table public.space_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null, owner_user_id uuid not null,
  object_path text not null unique,
  status text not null default 'pending' check (status in ('pending','ready')),
  content_sha256 text check (content_sha256 ~ '^[a-f0-9]{64}$'),
  byte_size integer check (byte_size between 1 and 1500000),
  expires_at timestamptz not null default now()+interval '24 hours',
  created_at timestamptz not null default now(),
  foreign key(project_id,owner_user_id) references public.space_projects(id,owner_user_id) on delete cascade
);
create index space_assets_expiry_idx on public.space_assets(expires_at);
create table public.space_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null, owner_user_id uuid not null,
  request_id uuid not null, kind text not null check (kind in ('extract','analyze')),
  status text not null default 'pending' check (status in ('pending','complete','fallback','failed')),
  change_revision integer not null default 0,
  result jsonb, telemetry jsonb,
  created_at timestamptz not null default now(),
  unique(owner_user_id,request_id), unique(id,project_id,owner_user_id),
  foreign key(project_id,owner_user_id) references public.space_projects(id,owner_user_id) on delete cascade,
  check (result is null or octet_length(result::text)<=150000),
  check (telemetry is null or octet_length(telemetry::text)<=4000)
);
create unique index space_one_pending_run on public.space_analysis_runs(project_id) where status='pending';
-- Recommendations remain immutable inside the analysis snapshot; changes refer to its stable IDs.
create index space_extraction_history on public.space_analysis_runs(created_at desc) where kind='extract' and telemetry is not null;
create index space_extraction_reuse on public.space_analysis_runs(owner_user_id,project_id,(telemetry->>'inputFingerprint'),created_at desc) where kind='extract' and status='complete';

create table public.space_applied_changes (
  run_id uuid not null, project_id uuid not null, owner_user_id uuid not null,
  recommendation_id text not null check (recommendation_id ~ '^rec_[1-5]$'),
  applied boolean not null, updated_at timestamptz not null default now(),
  primary key(run_id,recommendation_id),
  foreign key(run_id,project_id,owner_user_id) references public.space_analysis_runs(id,project_id,owner_user_id) on delete cascade
);
create table public.space_reality_checks (
  id uuid primary key default gen_random_uuid(), request_id uuid not null,
  run_id uuid not null, project_id uuid not null, owner_user_id uuid not null,
  outcome text not null check (outcome in ('helpful','unchanged','unhelpful')),
  note text not null default '' check (char_length(note)<=500),
  days integer not null check (days in (30,90)), created_at timestamptz not null default now(),
  unique(owner_user_id,request_id),
  foreign key(run_id,project_id,owner_user_id) references public.space_analysis_runs(id,project_id,owner_user_id) on delete cascade
);
create table public.space_cleanup_queue (
  object_path text primary key, generation uuid not null default gen_random_uuid(), attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  retain_until timestamptz not null default (now()+interval '24 hours'), last_removed_at timestamptz,
  created_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['space_projects','space_rooms','space_assets','space_analysis_runs','space_applied_changes','space_reality_checks'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy owner_select on public.%I for select to authenticated using ((select auth.uid())=owner_user_id)', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    execute format('grant select on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('create index %I on public.%I(owner_user_id)',t||'_owner_idx',t);
  end loop;
end $$;
alter table public.space_cleanup_queue enable row level security;
revoke all on public.space_cleanup_queue from public,anon,authenticated;
grant all on public.space_cleanup_queue to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('space-private','space-private',false,1500000,array['image/jpeg']);
-- No storage.objects policy: only server service-role can read/write. No signed/public URLs.

create function public.space_reserve_asset(p_owner uuid,p_project uuid)
returns public.space_assets language plpgsql security definer set search_path='' as $$
declare result public.space_assets; asset_id uuid:=gen_random_uuid(); begin
  perform 1 from public.space_projects where id=p_project and owner_user_id=p_owner for update;
  if not found then raise exception 'project unavailable' using errcode='42501'; end if;
  if (select count(*) from public.space_assets where project_id=p_project)>=6 then raise exception 'asset limit' using errcode='23514'; end if;
  insert into public.space_assets(id,project_id,owner_user_id,object_path)
  values(asset_id,p_project,p_owner,p_owner::text||'/'||p_project::text||'/'||asset_id::text||'.jpg') returning * into result;
  return result;
end $$;
revoke all on function public.space_reserve_asset(uuid,uuid) from public,anon,authenticated;
grant execute on function public.space_reserve_asset(uuid,uuid) to service_role;

create function public.space_reserve_run(p_owner uuid,p_project uuid,p_request uuid,p_kind text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result public.space_analysis_runs; begin
  perform 1 from public.space_projects where id=p_project and owner_user_id=p_owner for update;
  if not found then raise exception 'project unavailable' using errcode='42501'; end if;
  update public.space_analysis_runs set status='failed',telemetry=jsonb_build_object('outcome','stale_run','billingUnknown',kind='extract')
    where project_id=p_project and status='pending' and created_at<now()-interval '3 minutes';
  select * into result from public.space_analysis_runs where owner_user_id=p_owner and request_id=p_request;
  if found then
    if result.project_id<>p_project or result.kind<>p_kind then raise exception 'request conflict' using errcode='23505'; end if;
    return jsonb_build_object('run',to_jsonb(result),'acquired',false);
  end if;
  insert into public.space_analysis_runs(project_id,owner_user_id,request_id,kind) values(p_project,p_owner,p_request,p_kind) returning * into result;
  return jsonb_build_object('run',to_jsonb(result),'acquired',true);
end $$;
revoke all on function public.space_reserve_run(uuid,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.space_reserve_run(uuid,uuid,uuid,text) to service_role;

create function public.space_create_project(p_owner uuid,p_title text,p_goal text,p_locale text)
returns public.space_projects language plpgsql security definer set search_path='' as $$
declare result public.space_projects; begin
  perform 1 from auth.users where id=p_owner for update;
  if not found then raise exception 'owner unavailable' using errcode='42501'; end if;
  if (select count(*) from public.space_projects where owner_user_id=p_owner)>=20 then raise exception 'project limit' using errcode='23514'; end if;
  insert into public.space_projects(owner_user_id,title,goal,locale) values(p_owner,p_title,p_goal,p_locale) returning * into result;
  return result;
end $$;
revoke all on function public.space_create_project(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.space_create_project(uuid,text,text,text) to service_role;

create function public.space_finish_analysis(p_owner uuid,p_project uuid,p_run uuid,p_result jsonb)
returns void language plpgsql security definer set search_path='' as $$
begin
  perform 1 from public.space_projects where id=p_project and owner_user_id=p_owner for update;
  if not found then raise exception 'project unavailable' using errcode='42501'; end if;
  update public.space_analysis_runs set status='complete',result=p_result
    where id=p_run and project_id=p_project and owner_user_id=p_owner and kind='analyze' and status='pending';
  if not found then raise exception 'run conflict' using errcode='23505'; end if;
  insert into public.space_rooms(project_id,owner_user_id,scene) values(p_project,p_owner,p_result->'current')
    on conflict(project_id) do update set scene=excluded.scene,updated_at=now();
end $$;
revoke all on function public.space_finish_analysis(uuid,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.space_finish_analysis(uuid,uuid,uuid,jsonb) to service_role;

create function public.space_save_change(p_owner uuid,p_project uuid,p_run uuid,p_revision integer,p_recommendation text,p_applied boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
  update public.space_analysis_runs set change_revision=change_revision+1
    where id=p_run and project_id=p_project and owner_user_id=p_owner and status='complete' and kind='analyze' and change_revision=p_revision;
  if not found then raise exception 'change conflict' using errcode='23505'; end if;
  insert into public.space_applied_changes(run_id,project_id,owner_user_id,recommendation_id,applied)
    values(p_run,p_project,p_owner,p_recommendation,p_applied)
    on conflict(run_id,recommendation_id) do update set applied=excluded.applied,updated_at=now();
end $$;
revoke all on function public.space_save_change(uuid,uuid,uuid,integer,text,boolean) from public,anon,authenticated;
grant execute on function public.space_save_change(uuid,uuid,uuid,integer,text,boolean) to service_role;

create function public.space_queue_asset_delete() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.space_cleanup_queue(object_path) values(old.object_path) on conflict(object_path) do update set generation=gen_random_uuid(),attempts=0,next_attempt_at=now(),retain_until=now()+interval '24 hours',last_removed_at=null; return old; end $$;
create trigger space_asset_cleanup after delete on public.space_assets for each row execute function public.space_queue_asset_delete();
revoke all on function public.space_queue_asset_delete() from public,anon,authenticated;

-- Existing PPI revisions require exactly one trigger reference; SET NULL on evidence
-- deletion violates that CHECK. Remove derived revisions before the source is deleted.
-- Remaining source observations survive; confidence returns to its documented starting
-- state pending reassessment, never silently retains confidence from deleted evidence.
create function public.pattern_before_evidence_delete() returns trigger language plpgsql security definer set search_path='' as $$
declare hypothesis uuid; begin
  for hypothesis in select hypothesis_id from public.evidence_hypothesis_links where evidence_id=old.id and owner_user_id=old.owner_user_id order by hypothesis_id loop
    perform 1 from public.pattern_hypotheses where id=hypothesis and owner_user_id=old.owner_user_id for update;
    -- Remove the link now: FK AFTER triggers run after a multi-row DELETE statement.
    delete from public.evidence_hypothesis_links where evidence_id=old.id and hypothesis_id=hypothesis and owner_user_id=old.owner_user_id;
    delete from public.confidence_revisions where hypothesis_id=hypothesis and owner_user_id=old.owner_user_id;
    update public.pattern_hypotheses h set current_confidence=initial_confidence,
      evidence_count=(select count(*) from public.evidence_hypothesis_links l where l.hypothesis_id=h.id and l.evidence_id<>old.id)+(select count(*) from public.pattern_reality_checks c where c.hypothesis_id=h.id),
      support_count=(select count(*) from public.evidence_hypothesis_links l where l.hypothesis_id=h.id and l.evidence_id<>old.id and l.relation='SUPPORT')+(select count(*) from public.pattern_reality_checks c where c.hypothesis_id=h.id and c.response in ('MATCH','PARTIAL')),
      contradiction_count=(select count(*) from public.evidence_hypothesis_links l where l.hypothesis_id=h.id and l.evidence_id<>old.id and l.relation='CONTRADICT')+(select count(*) from public.pattern_reality_checks c where c.hypothesis_id=h.id and c.response='MISMATCH'),
      ambiguous_count=(select count(*) from public.evidence_hypothesis_links l where l.hypothesis_id=h.id and l.evidence_id<>old.id and l.relation='AMBIGUOUS')+(select count(*) from public.pattern_reality_checks c where c.hypothesis_id=h.id and c.response='CONTEXT_DEPENDENT'),
      uncertainty_count=(select count(*) from public.evidence_hypothesis_links l where l.hypothesis_id=h.id and l.evidence_id<>old.id and l.relation='AMBIGUOUS')+(select count(*) from public.pattern_reality_checks c where c.hypothesis_id=h.id and c.response='CONTEXT_DEPENDENT'),
      provenance=provenance||jsonb_build_object('evidenceDeletionReevaluationRequired',true),updated_at=now()
      where h.id=hypothesis and h.owner_user_id=old.owner_user_id;
  end loop;
  delete from public.confidence_revisions where triggering_evidence_id=old.id and owner_user_id=old.owner_user_id;
  delete from public.pattern_graph_edges where owner_user_id=old.owner_user_id and ((source_node_type='evidence' and source_node_id=old.id) or (target_node_type='evidence' and target_node_id=old.id));
  return old;
end $$;
create trigger pattern_evidence_privacy_cleanup before delete on public.evidence_events for each row execute function public.pattern_before_evidence_delete();
revoke all on function public.pattern_before_evidence_delete() from public,anon,authenticated;

-- Repair only permissions needed by the existing SECURITY INVOKER deletion RPC.
-- Every DELETE remains scoped by auth.uid(); no insert/update grant is added.
do $$ declare t text; begin
  foreach t in array array['evidence_events','export_provenance','report_provenance','pattern_profiles'] loop
    execute format('grant delete on public.%I to authenticated',t);
    execute format('create policy account_owner_delete on public.%I for delete to authenticated using ((select auth.uid())=owner_user_id)',t);
  end loop;
end $$;
-- Account deletion retains auth identity. Hook its atomic receipt, not auth.users alone.
create function public.space_account_cleanup() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.operation='delete' and new.scope='all_data' then
    if auth.uid() is null or new.owner_user_id<>auth.uid() then raise exception 'owner mismatch' using errcode='42501'; end if;
    perform 1 from auth.users where id=new.owner_user_id for update;
    delete from public.space_projects where owner_user_id=new.owner_user_id;
    -- PPI profile links are SET NULL: explicitly remove remaining owner records.
    delete from public.confidence_revisions where owner_user_id=new.owner_user_id;
    delete from public.pattern_hypotheses where owner_user_id=new.owner_user_id;
    delete from public.evidence_events where owner_user_id=new.owner_user_id;
    delete from public.pattern_graph_edges where owner_user_id=new.owner_user_id;
  end if;
  return new;
end $$;
create trigger space_account_delete before insert on public.data_rights_requests for each row execute function public.space_account_cleanup();
revoke all on function public.space_account_cleanup() from public,anon,authenticated;
commit;
