begin;

-- public.rls_auto_enable() is an event-trigger function that turns RLS on for newly
-- created public tables. It is fired by the event trigger as its owner and is never
-- meant to be called directly, but it was left executable by the anon and
-- authenticated roles, which exposes it at /rest/v1/rpc/rls_auto_enable.
--
-- A direct call would fail anyway, because pg_event_trigger_ddl_commands() only
-- returns rows inside an event-trigger context. Revoking EXECUTE removes the exposed
-- surface rather than relying on that behaviour, and does not affect the event
-- trigger, which does not go through EXECUTE grants.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

commit;
