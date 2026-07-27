begin;

alter table public.payment_orders
  drop constraint if exists payment_orders_provider_check;
alter table public.payment_orders
  add constraint payment_orders_provider_check
  check (provider in ('toss', 'portone', 'manual_transfer'));

alter table public.payment_events
  drop constraint if exists payment_events_provider_check;
alter table public.payment_events
  add constraint payment_events_provider_check
  check (provider in ('toss', 'portone', 'manual_transfer'));

alter table public.payment_orders
  add column if not exists manual_depositor_name text,
  add column if not exists deposit_deadline timestamptz;

alter table public.payment_orders
  add constraint payment_orders_manual_depositor_name_check
  check (
    manual_depositor_name is null
    or char_length(manual_depositor_name) between 2 and 80
  );

alter table public.payment_orders
  add constraint payment_orders_manual_transfer_fields_check
  check (
    provider <> 'manual_transfer'
    or (
      manual_depositor_name is not null
      and deposit_deadline is not null
    )
  );

create index if not exists payment_orders_manual_waiting_idx
  on public.payment_orders (status, deposit_deadline, created_at desc)
  where provider = 'manual_transfer';

commit;
