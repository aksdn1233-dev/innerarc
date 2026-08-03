begin;

-- Buyers finish a reading and leave. Nothing in the product ever asked them what they
-- wanted to understand or whether the reading changed a decision, so the only evidence
-- on the storefront is the seller's own copy.
--
-- This table is deliberately additive and stands alone. It carries no foreign key into
-- public.payment_orders: an order number is copied in as plain text and the association
-- is proven in application code, so payment rows keep their existing delete behaviour,
-- constraints, and state machine untouched. Nothing here reads or writes payment state.
--
-- Reversal is a single `drop table public.product_reviews;` — the statement is written
-- out at the bottom of this file. No existing column, constraint, policy, grant, or row
-- is modified, so rolling back cannot lose customer, order, payment, or report data.
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),

  -- The order the reading belongs to. Null only for a participant who never had an
  -- order (a beta reader). Never used to join into payment tables at read time.
  order_id text unique
    check (order_id is null or order_id ~ '^[A-Za-z0-9_-]{6,64}$'),

  -- Written by the server from the order it verified, never from the submitted form,
  -- so a public label cannot claim a purchase that did not happen.
  review_type text not null
    check (review_type in ('verified_purchaser', 'beta_participant', 'free_reading')),

  product_code text
    check (product_code is null or product_code in ('plus_30d', 'pro_30d', 'premium_pdf')),
  locale text not null check (locale in ('ko', 'en')),

  -- The four questions. Everything here is untrusted visitor text, bounded before
  -- storage and never rendered as markup. Birth dates, the concern free-text, payment
  -- details, and report content are not collected by this form and have no column.
  wanted_to_understand text not null
    check (char_length(wanted_to_understand) between 5 and 600),
  most_useful text not null
    check (char_length(most_useful) between 5 and 600),
  hard_to_understand text not null default ''
    check (char_length(hard_to_understand) <= 600),
  changed_action text not null
    check (changed_action in ('changed', 'considering', 'unchanged', 'too_early')),

  -- Consent to publish is a separate decision from submitting feedback, so it is a
  -- separate column with a false default: a review that says nothing about consent is
  -- private feedback for the owner.
  public_consent boolean not null default false,
  display_name text not null default '' check (char_length(display_name) <= 16),
  hide_product_context boolean not null default false,

  -- 'pending' is the only state a submission can enter. Public display requires an
  -- explicit administrator move to 'approved'; there is no path that publishes on its
  -- own. 'withdrawn' is set when the reviewer takes their consent back.
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
  admin_note text not null default '' check (char_length(admin_note) <= 2000),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  consent_withdrawn_at timestamptz
);

-- The public read path: approved, still consented, newest first, per language.
create index if not exists product_reviews_public_idx
  on public.product_reviews (locale, status, public_consent, created_at desc);

-- The moderation queue.
create index if not exists product_reviews_moderation_idx
  on public.product_reviews (status, created_at desc);

alter table public.product_reviews enable row level security;
revoke all on table public.product_reviews from public, anon, authenticated;
grant all on table public.product_reviews to service_role;

commit;

-- Reversal (run manually if this feature is withdrawn):
--   begin;
--   drop table if exists public.product_reviews;
--   commit;
