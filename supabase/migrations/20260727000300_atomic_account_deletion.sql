begin;

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

  select result
  into existing_result
  from public.data_rights_requests
  where owner_user_id = current_user_id
    and request_id = p_request_id
    and operation = 'delete'
    and scope = p_scope;

  if found then
    return existing_result || jsonb_build_object('duplicate', true);
  end if;

  if exists (
    select 1
    from public.data_rights_requests
    where owner_user_id = current_user_id
      and request_id = p_request_id
  ) then
    raise exception 'idempotency conflict' using errcode = '23505';
  end if;

  if p_scope = 'third_party' then
    delete from public.tarot_readings
    where owner_user_id = current_user_id and subject = 'third_party';
    get diagnostics tarot_count = row_count;

    delete from public.reality_checks
    where owner_user_id = current_user_id and subject = 'third_party';
    get diagnostics reality_count = row_count;
  else
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
    'policyVersion', 'account-deletion-1.0.0',
    'requestId', p_request_id,
    'scope', p_scope,
    'completedAt', completed_at,
    'deletedByCollection', jsonb_build_object(
      'tarot_readings', tarot_count,
      'reality_checks', reality_count,
      'consent_receipts', consent_count,
      'profiles', profile_count
    ),
    'totalDeleted', tarot_count + reality_count + consent_count + profile_count,
    'duplicate', false,
    'authIdentityRetained', true
  );

  insert into public.data_rights_requests (
    owner_user_id,
    request_id,
    operation,
    scope,
    completed_at,
    result
  ) values (
    current_user_id,
    p_request_id,
    'delete',
    p_scope,
    completed_at,
    deletion_result
  );

  return deletion_result;
end;
$$;

revoke all on function public.delete_account_data(text, text) from public, anon;
grant execute on function public.delete_account_data(text, text) to authenticated, service_role;

commit;
