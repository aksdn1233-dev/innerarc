begin;

alter table public.payment_orders
  drop constraint if exists payment_orders_product_code_check;
alter table public.payment_orders
  add constraint payment_orders_product_code_check
  check (product_code in ('plus_30d', 'pro_30d', 'premium_pdf'));
alter table public.payment_orders
  alter column owner_user_id drop not null;
alter table public.payment_orders
  add column if not exists guest_access_token_hash text;
alter table public.payment_orders
  add constraint payment_orders_owner_or_guest_check
  check (
    (owner_user_id is not null and guest_access_token_hash is null)
    or
    (owner_user_id is null and guest_access_token_hash ~ '^[a-f0-9]{64}$')
  );

create table if not exists public.purchased_reports (
  order_id text primary key references public.payment_orders(order_id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete cascade,
  guest_access_token_hash text,
  product_code text not null check (product_code in ('plus_30d', 'pro_30d', 'premium_pdf')),
  locale text not null check (locale in ('ko', 'en')),
  input jsonb not null,
  report jsonb,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'ready', 'failed', 'revoked')),
  ready_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  ,check (
    (owner_user_id is not null and guest_access_token_hash is null)
    or
    (owner_user_id is null and guest_access_token_hash ~ '^[a-f0-9]{64}$')
  )
);

create table if not exists public.notification_preferences (
  owner_user_id uuid primary key references auth.users(id) on delete cascade,
  in_app_enabled boolean not null default true,
  caution_reminders boolean not null default true,
  email_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_settings (
  id smallint primary key check (id = 1),
  sales_enabled boolean not null default true,
  notice text not null default '' check (char_length(notice) <= 500),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into public.admin_settings (id) values (1) on conflict (id) do nothing;

create index if not exists purchased_reports_owner_created_idx
  on public.purchased_reports (owner_user_id, created_at desc);

alter table public.purchased_reports enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.admin_settings enable row level security;

create policy "purchased_reports_owner_select" on public.purchased_reports
  for select to authenticated
  using (owner_user_id is not null and (select auth.uid()) = owner_user_id);

create policy "notification_preferences_owner_all" on public.notification_preferences
  for all to authenticated
  using ((select auth.uid()) = owner_user_id)
  with check ((select auth.uid()) = owner_user_id);

revoke all on table public.purchased_reports from public, anon, authenticated;
grant select on table public.purchased_reports to authenticated;
grant all on table public.purchased_reports to service_role;

revoke all on table public.notification_preferences from public, anon;
grant select, insert, update, delete on table public.notification_preferences to authenticated;
grant all on table public.notification_preferences to service_role;
revoke all on table public.admin_settings from public, anon, authenticated;
grant all on table public.admin_settings to service_role;

create or replace function public.apply_verified_payment(
  p_owner_user_id uuid,
  p_order_id text,
  p_payment_key text,
  p_status text,
  p_method text,
  p_provider_snapshot jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_order public.payment_orders%rowtype;
  resulting_valid_until timestamptz;
  resulting_tier text;
  active_source_order_id text;
  grant_changed integer := 0;
begin
  if p_status not in (
    'READY',
    'IN_PROGRESS',
    'WAITING_FOR_DEPOSIT',
    'DONE',
    'CANCELED',
    'PARTIAL_CANCELED',
    'ABORTED',
    'EXPIRED'
  ) then
    raise exception 'invalid payment status' using errcode = '22023';
  end if;

  select *
  into target_order
  from public.payment_orders
  where order_id = p_order_id
    and owner_user_id = p_owner_user_id
  for update;

  if not found then
    raise exception 'payment order not found' using errcode = 'P0002';
  end if;

  if target_order.payment_key is not null and target_order.payment_key <> p_payment_key then
    raise exception 'payment key conflict' using errcode = '23505';
  end if;

  update public.payment_orders
  set
    payment_key = p_payment_key,
    status = p_status,
    method = p_method,
    provider_snapshot = coalesce(p_provider_snapshot, '{}'::jsonb),
    updated_at = now()
  where order_id = p_order_id;

  if p_status = 'DONE' then
    resulting_tier := case target_order.product_code
      when 'plus_30d' then 'plus'
      when 'pro_30d' then 'pro'
      when 'premium_pdf' then 'pro'
      else null
    end;

    if resulting_tier is null then
      raise exception 'invalid product code' using errcode = '22023';
    end if;

    insert into public.entitlement_grants (
      order_id, owner_user_id, tier, granted_at
    ) values (
      p_order_id, p_owner_user_id, resulting_tier, now()
    )
    on conflict (order_id) do update
    set revoked_at = null, granted_at = now()
    where public.entitlement_grants.revoked_at is not null;
    get diagnostics grant_changed = row_count;

    if grant_changed > 0 then
      insert into public.account_entitlements (
        owner_user_id, tier, valid_until, source_order_id, updated_at
      ) values (
        p_owner_user_id, resulting_tier, now() + interval '30 days', p_order_id, now()
      )
      on conflict (owner_user_id) do update
      set
        tier = case
          when public.account_entitlements.tier = 'pro'
            and public.account_entitlements.valid_until > now() then 'pro'
          else excluded.tier
        end,
        valid_until = greatest(now(), public.account_entitlements.valid_until) + interval '30 days',
        source_order_id = excluded.source_order_id,
        updated_at = now();
    end if;

    select valid_until, tier
    into resulting_valid_until, resulting_tier
    from public.account_entitlements
    where owner_user_id = p_owner_user_id;
  elsif target_order.status = 'DONE' then
    update public.entitlement_grants
    set revoked_at = now()
    where order_id = p_order_id
      and owner_user_id = p_owner_user_id
      and revoked_at is null;
    get diagnostics grant_changed = row_count;

    update public.purchased_reports
    set status = 'revoked', updated_at = now()
    where order_id = p_order_id
      and owner_user_id = p_owner_user_id;

    if grant_changed > 0 then
      select order_id, tier
      into active_source_order_id, resulting_tier
      from public.entitlement_grants
      where owner_user_id = p_owner_user_id
        and revoked_at is null
      order by case tier when 'pro' then 0 else 1 end, granted_at desc
      limit 1;

      if active_source_order_id is null then
        delete from public.account_entitlements
        where owner_user_id = p_owner_user_id;
        resulting_valid_until := null;
        resulting_tier := null;
      else
        update public.account_entitlements
        set
          tier = resulting_tier,
          valid_until = greatest(now(), valid_until - interval '30 days'),
          source_order_id = active_source_order_id,
          updated_at = now()
        where owner_user_id = p_owner_user_id
        returning valid_until into resulting_valid_until;
      end if;
    end if;
  else
    select valid_until, tier
    into resulting_valid_until, resulting_tier
    from public.account_entitlements
    where owner_user_id = p_owner_user_id;
  end if;

  return jsonb_build_object(
    'orderId', p_order_id,
    'status', p_status,
    'tier', resulting_tier,
    'validUntil', resulting_valid_until
  );
end;
$$;

revoke all on function public.apply_verified_payment(uuid, text, text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.apply_verified_payment(uuid, text, text, text, text, jsonb)
  to service_role;

commit;
