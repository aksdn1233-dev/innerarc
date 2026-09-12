begin;

alter table public.pattern_hypotheses drop constraint if exists pattern_hypotheses_source_system_check;
alter table public.pattern_hypotheses add constraint pattern_hypotheses_source_system_check
  check (source_system in ('saju','numerology','tarot','dream','relationship','behavioral','user_reported','derived'));

alter table public.pattern_graph_edges drop constraint if exists pattern_graph_edges_source_node_type_check;
alter table public.pattern_graph_edges add constraint pattern_graph_edges_source_node_type_check
  check (source_node_type in ('hypothesis','reality_check','evidence','outcome','dream','symbol','emotion','relationship_context','time'));
alter table public.pattern_graph_edges drop constraint if exists pattern_graph_edges_target_node_type_check;
alter table public.pattern_graph_edges add constraint pattern_graph_edges_target_node_type_check
  check (target_node_type in ('hypothesis','reality_check','evidence','outcome','dream','symbol','emotion','relationship_context','time'));

create table public.dream_events (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  client_request_id text not null check (client_request_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'),
  dream_date date not null,
  recorded_at timestamptz not null default now(),
  raw_text text check (raw_text is null or char_length(raw_text) between 1 and 4000),
  raw_text_retained boolean not null default false,
  current_concern text not null default '' check (char_length(current_concern) <= 500),
  normalized_summary text not null check (char_length(normalized_summary) between 1 and 800),
  ontology jsonb not null default '[]'::jsonb check (jsonb_typeof(ontology) = 'array'),
  categories text[] not null check (cardinality(categories) between 1 and 10),
  initial_interpretation jsonb not null check (jsonb_typeof(initial_interpretation) = 'object'),
  initial_timestamp timestamptz not null,
  current_interpretation jsonb not null check (jsonb_typeof(current_interpretation) = 'object'),
  source_refs text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_user_id, client_request_id),
  unique(id, owner_user_id),
  check (raw_text_retained or raw_text is null),
  check (initial_timestamp = recorded_at)
);

create table public.dream_followups (
  id uuid primary key default gen_random_uuid(),
  dream_event_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  client_request_id text check (client_request_id is null or client_request_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'),
  due_days integer not null check (due_days in (3,7,30)),
  due_date date not null,
  completed_at timestamptz,
  outcome text check (outcome is null or outcome in ('none','money','work','new_person','relationship','family','health','exam','business','move','other')),
  note text not null default '' check (char_length(note) <= 1000),
  fit text check (fit is null or fit in ('MATCH','PARTIAL','MISMATCH','CONTEXT_DEPENDENT')),
  created_at timestamptz not null default now(),
  foreign key(dream_event_id, owner_user_id) references public.dream_events(id, owner_user_id) on delete cascade,
  unique(dream_event_id, due_days),
  unique(owner_user_id, client_request_id)
);

create table public.dream_interpretation_revisions (
  id uuid primary key default gen_random_uuid(),
  dream_event_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  revision integer not null check (revision between 1 and 100),
  reason text not null check (char_length(reason) between 1 and 500),
  interpretation jsonb not null check (jsonb_typeof(interpretation) = 'object'),
  created_at timestamptz not null default now(),
  foreign key(dream_event_id, owner_user_id) references public.dream_events(id, owner_user_id) on delete cascade,
  unique(dream_event_id, revision)
);

create index dream_events_owner_date_idx on public.dream_events(owner_user_id, dream_date desc, recorded_at desc);
create index dream_followups_owner_due_idx on public.dream_followups(owner_user_id, due_date) where completed_at is null;

alter table public.dream_events enable row level security;
alter table public.dream_followups enable row level security;
alter table public.dream_interpretation_revisions enable row level security;
create policy dream_events_owner_select on public.dream_events for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy dream_followups_owner_select on public.dream_followups for select to authenticated using ((select auth.uid()) = owner_user_id);
create policy dream_revisions_owner_select on public.dream_interpretation_revisions for select to authenticated using ((select auth.uid()) = owner_user_id);
revoke all on public.dream_events, public.dream_followups, public.dream_interpretation_revisions from public, anon, authenticated;
grant select on public.dream_events, public.dream_followups, public.dream_interpretation_revisions to authenticated;
grant all on public.dream_events, public.dream_followups, public.dream_interpretation_revisions to service_role;

create function public.dream_protect_initial_interpretation() returns trigger language plpgsql set search_path='' as $$
begin
  if new.initial_interpretation is distinct from old.initial_interpretation
    or new.initial_timestamp is distinct from old.initial_timestamp
    or new.recorded_at is distinct from old.recorded_at then
    raise exception 'initial dream interpretation is immutable' using errcode='23514';
  end if;
  return new;
end $$;
create trigger dream_initial_interpretation_immutable before update on public.dream_events for each row execute function public.dream_protect_initial_interpretation();
revoke all on function public.dream_protect_initial_interpretation() from public,anon,authenticated;

create function public.dream_create_event(p_owner uuid, p_request text, p_event jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare event_id uuid; stored_at timestamptz := now();
begin
  if p_request !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$' then raise exception 'invalid request id' using errcode='22023'; end if;
  -- This RPC is service-role only. The API authenticates the session and passes its
  -- verified owner id; the database still requires that owner to exist.
  perform 1 from auth.users where id=p_owner for update;
  if not found then raise exception 'owner unavailable' using errcode='42501'; end if;
  select id into event_id from public.dream_events where owner_user_id=p_owner and client_request_id=p_request;
  if found then return event_id; end if;
  if (select count(*) from public.dream_events where owner_user_id=p_owner) >= 500 then raise exception 'dream event limit' using errcode='23514'; end if;
  insert into public.dream_events(id,owner_user_id,client_request_id,dream_date,recorded_at,raw_text,raw_text_retained,current_concern,normalized_summary,ontology,categories,initial_interpretation,initial_timestamp,current_interpretation,source_refs)
  values((p_event->>'id')::uuid,p_owner,p_request,(p_event->>'dreamDate')::date,stored_at,
    case when coalesce((p_event->>'rawTextRetained')::boolean,false) then nullif(p_event->>'rawText','') else null end,
    coalesce((p_event->>'rawTextRetained')::boolean,false),left(coalesce(p_event->>'currentConcern',''),500),left(p_event->>'normalizedSummary',800),
    coalesce(p_event->'ontology','[]'::jsonb),array(select jsonb_array_elements_text(p_event->'categories')),p_event->'initialInterpretation',stored_at,p_event->'initialInterpretation',array(select jsonb_array_elements_text(coalesce(p_event->'sourceRefs','[]'::jsonb))))
  returning id into event_id;
  insert into public.dream_followups(dream_event_id,owner_user_id,due_days,due_date)
    select event_id,p_owner,days,(p_event->>'dreamDate')::date+days from unnest(array[3,7,30]) days;
  return event_id;
end $$;
revoke all on function public.dream_create_event(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.dream_create_event(uuid,text,jsonb) to service_role;

create function public.dream_complete_followup(p_owner uuid,p_event uuid,p_request text,p_days integer,p_outcome text,p_note text,p_fit text,p_interpretation jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare next_revision integer; evidence_id uuid; due_on date; existing_request text;
begin
  if p_days not in (3,7,30) or p_request !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$' then raise exception 'invalid followup' using errcode='22023'; end if;
  perform 1 from public.dream_events where id=p_event and owner_user_id=p_owner for update;
  if not found then raise exception 'not found' using errcode='P0002'; end if;
  select due_date,client_request_id into due_on,existing_request from public.dream_followups
    where dream_event_id=p_event and owner_user_id=p_owner and due_days=p_days for update;
  if not found then raise exception 'not found' using errcode='P0002'; end if;
  if due_on>current_date then raise exception 'followup not due' using errcode='23514'; end if;
  if existing_request=p_request then return; end if;
  select coalesce(max(revision),0)+1 into next_revision from public.dream_interpretation_revisions where dream_event_id=p_event;
  insert into public.dream_interpretation_revisions(dream_event_id,owner_user_id,revision,reason,interpretation)
    values(p_event,p_owner,next_revision,'Reality Check +'||p_days||'d: '||p_fit,p_interpretation);
  update public.dream_followups set client_request_id=p_request,completed_at=now(),outcome=p_outcome,note=left(coalesce(p_note,''),1000),fit=p_fit
    where dream_event_id=p_event and owner_user_id=p_owner and due_days=p_days;
  update public.dream_events set current_interpretation=p_interpretation,updated_at=now() where id=p_event and owner_user_id=p_owner;
  insert into public.evidence_events(owner_user_id,client_request_id,event_type,life_domain,event_date,short_description,outcome,user_confirmed,source,subject)
    values(p_owner,p_request,'dream_followup_'||p_outcome,
      case when p_outcome='work' then 'work' when p_outcome='money' then 'money' when p_outcome='relationship' then 'relationship' when p_outcome='family' then 'family' when p_outcome='health' then 'health_lifestyle' when p_outcome='exam' then 'education' when p_outcome='move' then 'move' when p_outcome='business' then 'work' else 'other' end,
      current_date,'Dream Reality Check +'||p_days||'d',
      case when p_fit='MATCH' then 'positive' when p_fit='MISMATCH' then 'negative' when p_fit='PARTIAL' then 'mixed' else 'unresolved' end,
      true,'user_reported','owner')
    on conflict(owner_user_id,client_request_id) do update set event_type=excluded.event_type,life_domain=excluded.life_domain,event_date=excluded.event_date,short_description=excluded.short_description,outcome=excluded.outcome,updated_at=now()
    returning id into evidence_id;
  insert into public.pattern_graph_edges(owner_user_id,source_node_type,source_node_id,target_node_type,target_node_id,relationship_type,context,observed_at)
    values(p_owner,'dream',p_event,'evidence',evidence_id,'FOLLOW_UP_EVIDENCE',jsonb_build_object('dueDays',p_days,'fit',p_fit),now())
    on conflict(owner_user_id,source_node_type,source_node_id,target_node_type,target_node_id,relationship_type) do update set context=excluded.context,observed_at=excluded.observed_at;
end $$;
revoke all on function public.dream_complete_followup(uuid,uuid,text,integer,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.dream_complete_followup(uuid,uuid,text,integer,text,text,text,jsonb) to service_role;

-- Account deletion is authoritative even while the feature flag is off.
create function public.dream_account_cleanup() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.operation='delete' and new.scope='all_data' then
    if auth.uid() is null or new.owner_user_id<>auth.uid() then raise exception 'owner mismatch' using errcode='42501'; end if;
    delete from public.dream_events where owner_user_id=new.owner_user_id;
  end if;
  return new;
end $$;
create trigger dream_account_delete before insert on public.data_rights_requests for each row execute function public.dream_account_cleanup();
revoke all on function public.dream_account_cleanup() from public,anon,authenticated;

commit;
