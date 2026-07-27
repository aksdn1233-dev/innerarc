begin;

alter table public.payment_orders
  drop constraint if exists payment_orders_provider_check;
alter table public.payment_orders
  add constraint payment_orders_provider_check
  check (provider in ('toss', 'portone', 'manual_transfer', 'payapp'));

alter table public.payment_events
  drop constraint if exists payment_events_provider_check;
alter table public.payment_events
  add constraint payment_events_provider_check
  check (provider in ('toss', 'portone', 'manual_transfer', 'payapp'));

create index if not exists payment_orders_payapp_request_idx
  on public.payment_orders ((provider_snapshot->>'requestNumber'))
  where provider = 'payapp';

commit;
