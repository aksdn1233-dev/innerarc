begin;

alter table public.admin_settings
  add column if not exists page_content jsonb not null default '{}'::jsonb;

create table if not exists public.operational_metrics_daily (
  metric_date date not null,
  locale text not null check (locale in ('ko', 'en')),
  event_name text not null check (event_name in (
    'landing_view', 'primary_cta_click', 'sample_section_view', 'product_view',
    'product_select', 'form_start', 'form_complete', 'payment_start',
    'payment_success', 'payment_fail'
  )),
  dimension text not null default 'all' check (dimension ~ '^[A-Za-z0-9:_-]{1,80}$'),
  count bigint not null default 0 check (count >= 0),
  updated_at timestamptz not null default now(),
  primary key (metric_date, locale, event_name, dimension)
);

alter table public.operational_metrics_daily enable row level security;
revoke all on table public.operational_metrics_daily from public, anon, authenticated;
grant all on table public.operational_metrics_daily to service_role;

create or replace function public.increment_operational_metric(
  p_metric_date date,
  p_locale text,
  p_event_name text,
  p_dimension text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_metric_date < current_date - 1 or p_metric_date > current_date + 1
    or p_locale not in ('ko', 'en')
    or p_event_name not in (
      'landing_view', 'primary_cta_click', 'sample_section_view', 'product_view',
      'product_select', 'form_start', 'form_complete', 'payment_start',
      'payment_success', 'payment_fail'
    )
    or p_dimension !~ '^[A-Za-z0-9:_-]{1,80}$'
  then
    raise exception 'invalid operational metric';
  end if;

  insert into public.operational_metrics_daily (
    metric_date, locale, event_name, dimension, count, updated_at
  ) values (
    p_metric_date, p_locale, p_event_name, p_dimension, 1, now()
  )
  on conflict (metric_date, locale, event_name, dimension)
  do update set
    count = public.operational_metrics_daily.count + 1,
    updated_at = now();
end;
$$;

revoke all on function public.increment_operational_metric(date, text, text, text)
  from public, anon, authenticated;
grant execute on function public.increment_operational_metric(date, text, text, text)
  to service_role;

commit;
