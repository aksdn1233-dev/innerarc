begin;

create table if not exists public.payment_orders (
  order_id text primary key check (order_id ~ '^[A-Za-z0-9_-]{6,64}$'),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  product_code text not null check (product_code in ('plus_30d', 'pro_30d')),
  provider text not null check (provider = 'toss'),
  amount integer not null check (amount between 100 and 10000000),
  currency text not null check (currency = 'KRW'),
  status text not null default 'CREATED' check (
    status in (
      'CREATED',
      'READY',
      'IN_PROGRESS',
      'WAITING_FOR_DEPOSIT',
      'DONE',
      'CANCELED',
      'PARTIAL_CANCELED',
      'ABORTED',
      'EXPIRED'
    )
  ),
  payment_key text check (payment_key is null or char_length(payment_key) between 10 and 300),
  method text check (method is null or char_length(method) between 1 and 100),
  provider_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, payment_key)
);

create table if not exists public.payment_events (
  transmission_id text primary key check (char_length(transmission_id) between 8 and 200),
  order_id text not null references public.payment_orders(order_id) on delete cascade,
  provider text not null check (provider = 'toss'),
  event_type text not null check (char_length(event_type) between 1 and 100),
  verified_status text not null check (char_length(verified_status) between 1 and 40),
  received_at timestamptz not null default now()
);

create table if not exists public.account_entitlements (
  owner_user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null check (tier in ('plus', 'pro')),
  valid_until timestamptz not null,
  source_order_id text not null references public.payment_orders(order_id),
  updated_at timestamptz not null default now()
);

create table if not exists public.entitlement_grants (
  order_id text primary key references public.payment_orders(order_id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null check (tier in ('plus', 'pro')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists payment_orders_owner_created_idx
  on public.payment_orders (owner_user_id, created_at desc);

create index if not exists payment_events_order_received_idx
  on public.payment_events (order_id, received_at desc);

alter table public.payment_orders enable row level security;
alter table public.payment_events enable row level security;
alter table public.account_entitlements enable row level security;
alter table public.entitlement_grants enable row level security;

revoke all on table public.payment_orders from public, anon, authenticated;
revoke all on table public.payment_events from public, anon, authenticated;
revoke all on table public.account_entitlements from public, anon, authenticated;
revoke all on table public.entitlement_grants from public, anon, authenticated;
grant all on table public.payment_orders to service_role;
grant all on table public.payment_events to service_role;
grant all on table public.account_entitlements to service_role;
grant all on table public.entitlement_grants to service_role;

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
      else null
    end;

    if resulting_tier is null then
      raise exception 'invalid product code' using errcode = '22023';
    end if;

    insert into public.entitlement_grants (
      order_id,
      owner_user_id,
      tier,
      granted_at
    ) values (
      p_order_id,
      p_owner_user_id,
      resulting_tier,
      now()
    )
    on conflict (order_id) do update
    set
      revoked_at = null,
      granted_at = now()
    where public.entitlement_grants.revoked_at is not null;
    get diagnostics grant_changed = row_count;

    if grant_changed > 0 then
      insert into public.account_entitlements (
        owner_user_id,
        tier,
        valid_until,
        source_order_id,
        updated_at
      ) values (
        p_owner_user_id,
        resulting_tier,
        now() + interval '30 days',
        p_order_id,
        now()
      )
      on conflict (owner_user_id) do update
      set
        tier = case
          when public.account_entitlements.tier = 'pro' and public.account_entitlements.valid_until > now()
            then 'pro'
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
