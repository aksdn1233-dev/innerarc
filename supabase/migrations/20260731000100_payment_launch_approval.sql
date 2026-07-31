begin;

-- Lets the owner record an explicit, audited "this deployment may take money" decision
-- from the signed-in administrator console instead of only through a deployment
-- secret. The environment flag PAYMENTS_LAUNCH_APPROVED=true still works and still
-- counts on its own; this is a second way to state the same approval, not a way to
-- skip it. Merchant credentials alone continue to open nothing.
alter table public.admin_settings
  add column if not exists payments_launch_approved boolean not null default false;
alter table public.admin_settings
  add column if not exists payments_launch_approved_at timestamptz;
alter table public.admin_settings
  add column if not exists payments_launch_approved_by uuid
    references auth.users(id) on delete set null;

-- Why a provider call failed, in the payment company's own words. Without this a
-- rejected PayApp request reached the operator only as a generic checkout error, so a
-- merchant-side cause (pending seller review, an unregistered callback address) was
-- indistinguishable from a bug. Server-role only: no policy is created, so row-level
-- security denies every authenticated and anonymous client.
create table if not exists public.payment_setup_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  provider text not null check (char_length(provider) <= 40),
  stage text not null check (stage in ('provider_request', 'provider_cancel', 'callback')),
  code text not null check (char_length(code) <= 80),
  message text not null default '' check (char_length(message) <= 500),
  order_id text check (char_length(order_id) <= 64)
);

create index if not exists payment_setup_events_created_idx
  on public.payment_setup_events (created_at desc);

alter table public.payment_setup_events enable row level security;

commit;
