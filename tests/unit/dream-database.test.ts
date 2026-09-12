import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const owner = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const eventId = "33333333-3333-4333-8333-333333333333";
const requestId = "dream-create-0001";
let db: PGlite;

function migration(file: string) {
  return readFileSync(`supabase/migrations/${file}`, "utf8").replace(/create extension if not exists pgcrypto;/g, "");
}
async function admin() { await db.exec("reset role;"); }
async function asOwner(id: string) { await db.exec(`reset role; select set_config('request.jwt.claim.sub','${id}',false); set role authenticated;`); }
async function asService() { await db.exec("reset role; set role service_role;"); }
const eventPayload = {
  id: eventId,
  dreamDate: new Date().toISOString().slice(0, 10),
  rawText: "Synthetic snake dream",
  rawTextRetained: false,
  currentConcern: "Synthetic concern",
  normalizedSummary: "A snake appeared in a room.",
  ontology: [{ kind: "entity", code: "snake" }],
  categories: ["SYMBOLIC"],
  initialInterpretation: { schemaVersion: "dream-intelligence-1.0.0", title: "Synthetic interpretation" },
  sourceRefs: ["artemidorus-oneirocritica"],
};

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated,service_role,anon; grant execute on function auth.uid() to authenticated,service_role,anon;
    create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    insert into auth.users values('${owner}'),('${other}');`);
  await db.exec(migration("20260727000100_initial_account_persistence.sql"));
  await db.exec(migration("20260727000200_authenticated_table_grants.sql"));
  // Existing account deletion SQL references these production tables from later migrations.
  for (const table of ["notification_preferences", "daily_notification_deliveries", "report_acquisition_surveys"]) {
    await db.exec(`create table public.${table}(owner_user_id uuid); alter table public.${table} enable row level security; create policy owner_all on public.${table} for all to authenticated using(auth.uid()=owner_user_id); grant select,delete on public.${table} to authenticated;`);
  }
  await db.exec(migration("20260830000100_personal_pattern_intelligence_p0.sql"));
  // The production migration sequence repairs authenticated deletion grants here.
  await db.exec(migration("20260907000100_space_intelligence_v1.sql"));
  await db.exec(migration("20260913000100_dream_intelligence_v1.sql"));
}, 30_000);
afterAll(async () => { await db?.close(); });

describe.sequential("Dream Intelligence PostgreSQL boundary", () => {
  it("runs the actual migration and creates one idempotent owner record", async () => {
    await asService();
    const first = await db.query<{ id: string }>("select public.dream_create_event($1,$2,$3) id", [owner, requestId, JSON.stringify(eventPayload)]);
    const duplicate = await db.query<{ id: string }>("select public.dream_create_event($1,$2,$3) id", [owner, requestId, JSON.stringify({ ...eventPayload, id: crypto.randomUUID() })]);
    expect(first.rows[0].id).toBe(eventId);
    expect(duplicate.rows[0].id).toBe(eventId);
    await admin();
    expect((await db.query("select * from dream_events where owner_user_id=$1", [owner])).rows).toHaveLength(1);
    expect((await db.query("select * from dream_followups where owner_user_id=$1", [owner])).rows).toHaveLength(3);
  });

  it("allows owner reads, hides foreign records and denies browser writes/RPC calls", async () => {
    await asOwner(other);
    expect((await db.query("select * from dream_events")).rows).toHaveLength(0);
    await asOwner(owner);
    expect((await db.query("select * from dream_events")).rows).toHaveLength(1);
    await expect(db.query("insert into dream_events(owner_user_id,client_request_id,dream_date,normalized_summary,categories,initial_interpretation,initial_timestamp,current_interpretation) values($1,'browser-write-01',current_date,'x',array['SYMBOLIC'],'{}',now(),'{}')", [owner])).rejects.toThrow(/permission denied/);
    await expect(db.query("select public.dream_create_event($1,'browser-rpc-0001',$2)", [owner, JSON.stringify(eventPayload)])).rejects.toThrow(/permission denied/);
    await admin();
  });

  it("keeps the initial interpretation immutable", async () => {
    await expect(db.query("update dream_events set initial_interpretation='{\"changed\":true}' where id=$1", [eventId])).rejects.toThrow(/immutable/);
  });

  it("blocks early checks, then appends one idempotent revision and graph link when due", async () => {
    await asService();
    const args = [owner, eventId, "dream-check-0001", 3, "work", "Synthetic outcome", "PARTIAL", JSON.stringify({ title: "Revised synthetic interpretation" })];
    await expect(db.query("select public.dream_complete_followup($1,$2,$3,$4,$5,$6,$7,$8)", args)).rejects.toThrow(/not due/);
    await admin();
    await db.query("update dream_followups set due_date=current_date where dream_event_id=$1 and due_days=3", [eventId]);
    await asService();
    await db.query("select public.dream_complete_followup($1,$2,$3,$4,$5,$6,$7,$8)", args);
    await db.query("select public.dream_complete_followup($1,$2,$3,$4,$5,$6,$7,$8)", args);
    await admin();
    expect((await db.query("select * from dream_interpretation_revisions where dream_event_id=$1", [eventId])).rows).toHaveLength(1);
    expect((await db.query("select * from evidence_events where client_request_id='dream-check-0001'")).rows).toHaveLength(1);
    expect((await db.query("select * from pattern_graph_edges where source_node_type='dream' and source_node_id=$1", [eventId])).rows).toHaveLength(1);
  });

  it("deletes account dream records through the existing all-data path", async () => {
    await asOwner(owner);
    await db.query("select public.delete_account_data('delete-dream-test-0001','all_data')");
    await admin();
    expect((await db.query("select * from dream_events where owner_user_id=$1", [owner])).rows).toHaveLength(0);
    expect((await db.query("select * from dream_followups where owner_user_id=$1", [owner])).rows).toHaveLength(0);
  });
});
