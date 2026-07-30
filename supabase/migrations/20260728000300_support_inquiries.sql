begin;

-- Buyers have no account, so a question about a purchase has nowhere to go. Inquiries
-- are stored server-side with the order number the buyer quotes, and are readable only
-- through the service role: the owner console is the sole reader.
create table if not exists public.support_inquiries (
  id uuid primary key default gen_random_uuid(),
  order_id text check (order_id is null or order_id ~ '^[A-Za-z0-9_-]{6,64}$'),
  category text not null check (category in ('payment', 'report', 'refund', 'other')),
  contact text not null check (char_length(contact) between 5 and 120),
  message text not null check (char_length(message) between 5 and 2000),
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  admin_note text not null default '' check (char_length(admin_note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_inquiries_status_idx
  on public.support_inquiries (status, created_at desc);
create index if not exists support_inquiries_order_idx
  on public.support_inquiries (order_id)
  where order_id is not null;

alter table public.support_inquiries enable row level security;
revoke all on table public.support_inquiries from public, anon, authenticated;
grant all on table public.support_inquiries to service_role;

commit;
