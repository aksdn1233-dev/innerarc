begin;

revoke all on table public.profiles from anon;
revoke all on table public.consent_receipts from anon;
revoke all on table public.tarot_readings from anon;
revoke all on table public.reality_checks from anon;
revoke all on table public.data_rights_requests from anon;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.consent_receipts to authenticated;
grant select, insert, update, delete on table public.tarot_readings to authenticated;
grant select, insert, update, delete on table public.reality_checks to authenticated;
grant select, insert, update, delete on table public.data_rights_requests to authenticated;

commit;
