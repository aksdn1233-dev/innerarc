-- Draft foundation only. Do not apply until the referral launch checklist is approved.
-- Raw phone numbers must never be inserted; only keyed HMAC hashes are accepted.
create table if not exists public.referral_claims (
  id uuid primary key default gen_random_uuid(),
  referrer_phone_hash text not null check (referrer_phone_hash ~ '^[0-9a-f]{64}$'),
  invitee_phone_hash text not null check (invitee_phone_hash ~ '^[0-9a-f]{64}$'),
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'applied', 'rejected', 'revoked')),
  reward_basis_points integer not null default 2500
    check (reward_basis_points = 2500),
  qualified_order_id text unique,
  applied_order_id text,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  applied_at timestamptz,
  constraint referral_claims_not_self
    check (referrer_phone_hash <> invitee_phone_hash),
  constraint referral_claims_unique_pair
    unique (referrer_phone_hash, invitee_phone_hash)
);

alter table public.referral_claims enable row level security;

revoke all on table public.referral_claims from anon, authenticated;
grant all on table public.referral_claims to service_role;

create index if not exists referral_claims_referrer_status_idx
  on public.referral_claims (referrer_phone_hash, status, created_at desc);
