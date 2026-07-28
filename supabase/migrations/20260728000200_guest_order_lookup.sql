begin;

-- Purchases are one-off and guest-first, so a buyer returning later has no account to
-- sign in to. Order lookup takes the order number together with the phone number used
-- at checkout. Only a peppered hash is stored: the raw number stays with the payment
-- provider, and a copy of this table cannot be scanned for a known number.
alter table public.payment_orders
  add column if not exists customer_phone_hash text
  check (customer_phone_hash is null or customer_phone_hash ~ '^[a-f0-9]{64}$');

create index if not exists payment_orders_phone_lookup_idx
  on public.payment_orders (customer_phone_hash)
  where customer_phone_hash is not null;

commit;
