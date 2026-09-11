import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { manualScene } from "@/core/space/schema";
import { analyzeSpace } from "@/core/space/engine";
const owner = "11111111-1111-4111-8111-111111111111", other = "22222222-2222-4222-8222-222222222222";
let db: PGlite, projectId: string;
async function asOwner(id: string) { await db.exec(`reset role; select set_config('request.jwt.claim.sub','${id}',false); set role authenticated;`); }
async function admin() { await db.exec("reset role;"); }
function migration(file: string) { return readFileSync(`supabase/migrations/${file}`, "utf8").replace(/create extension if not exists pgcrypto;/g, ""); }
// Execute actual PostgreSQL SQL/RLS in PGlite. Auth and storage schemas are local stand-ins;
// this verifies migrations/functions/permissions, not hosted Supabase Storage or real sessions.
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
  // These unrelated existing tables are touched by the existing all-data deletion RPC.
  for (const t of ["notification_preferences", "daily_notification_deliveries", "report_acquisition_surveys"]) await db.exec(`create table public.${t}(owner_user_id uuid); alter table public.${t} enable row level security; create policy owner_all on public.${t} for all to authenticated using(auth.uid()=owner_user_id); grant select,delete on public.${t} to authenticated;`);
  await db.exec(migration("20260830000100_personal_pattern_intelligence_p0.sql"));
  await db.exec(migration("20260907000100_space_intelligence_v1.sql"));
  await db.exec(migration("20260912000100_korean_residential_template_engine.sql"));
  const p = await db.query<{ id: string }>("select (public.space_create_project($1,'Synthetic room','balance','en')).id", [owner]); projectId = p.rows[0].id;
}, 30_000);
afterAll(async () => { await db?.close(); });
describe.sequential("space PostgreSQL migration and owner isolation", () => {
  it("creates an explicitly private JPEG-only bucket", async () => { const result = await db.query<{ public: boolean; allowed_mime_types: string[] }>("select * from storage.buckets where id='space-private'"); expect(result.rows[0].public).toBe(false); expect(result.rows[0].allowed_mime_types).toEqual(["image/jpeg"]); });
  it("allows owner reads and denies foreign reads under actual RLS", async () => { await asOwner(other); expect((await db.query("select * from space_projects")).rows).toHaveLength(0); await asOwner(owner); expect((await db.query("select * from space_projects")).rows).toHaveLength(1); await admin(); });
  it("pins one versioned template while keeping private residence metadata owner isolated", async () => {
    await admin();
    await db.query("select public.space_save_template_selection($1,$2,$3)", [owner, projectId, JSON.stringify({ templateId:"kr_internal_20",templateVersion:"1.0.0",variant:"mirrored",matchScore:82,evidenceStatus:"LIKELY",privateResidence:{complexName:"비공개 단지",buildingLabel:"A",unitType:"84A"} })]);
    await asOwner(other); expect((await db.query("select * from space_template_selections")).rows).toHaveLength(0);
    await asOwner(owner); const selected=await db.query<{template_version:string;private_residence:{complexName:string}}>("select template_version,private_residence from space_template_selections"); expect(selected.rows[0]).toMatchObject({template_version:"1.0.0",private_residence:{complexName:"비공개 단지"}}); await admin();
  });
  it("stores corrections per owner/project and never rewrites a global revision", async () => {
    const request="44444444-4444-4444-8444-444444444444";
    await db.query("select public.space_save_template_correction($1,$2,$3,$4,$5,$6)",[owner,projectId,request,"kr_internal_20","1.0.0",JSON.stringify({field:"opening",note:"창 위치를 직접 수정"})]);
    expect((await db.query("select * from space_template_corrections where owner_user_id=$1",[owner])).rows).toHaveLength(1);
    expect((await db.query("select * from residential_template_revisions")).rows).toHaveLength(0);
    expect((await db.query("select * from residential_template_revision_candidates")).rows).toHaveLength(0);
  });
  it("denies browser direct writes and privileged RPC calls", async () => { await asOwner(owner); await expect(db.query("insert into space_projects(owner_user_id,title,goal,locale) values($1,'Bypass','rest','en')", [owner])).rejects.toThrow(/permission denied/); await expect(db.query("select public.space_reserve_asset($1,$2)", [owner, projectId])).rejects.toThrow(/permission denied/); await admin(); });
  it("refuses cross-owner child association", async () => { await expect(db.query("insert into space_rooms(project_id,owner_user_id,scene) values($1,$2,'{}')", [projectId, other])).rejects.toThrow(/foreign key/); });
  it("reserves exactly six upload slots with server-generated private keys", async () => { for (let i = 0; i < 6; i++) { const row = await db.query<{ object_path: string }>("select (public.space_reserve_asset($1,$2)).object_path", [owner, projectId]); expect(row.rows[0].object_path).toMatch(new RegExp(`^${owner}/${projectId}/.*\\.jpg$`)); } await expect(db.query("select public.space_reserve_asset($1,$2)", [owner, projectId])).rejects.toThrow("asset limit"); });
  it("denies reservation for another owner's project", async () => { await expect(db.query("select public.space_reserve_asset($1,$2)", [other, projectId])).rejects.toThrow("project unavailable"); });
  it("leases a request once and returns a duplicate without another charge", async () => {
    const request = "33333333-3333-4333-8333-333333333333";
    const first = await db.query<{ result: { acquired: boolean; run: { id: string } } }>("select public.space_reserve_run($1,$2,$3,'extract') result", [owner, projectId, request]);
    const second = await db.query<{ result: { acquired: boolean } }>("select public.space_reserve_run($1,$2,$3,'extract') result", [owner, projectId, request]);
    expect(first.rows[0].result.acquired).toBe(true); expect(second.rows[0].result.acquired).toBe(false);
    await expect(db.query("select public.space_reserve_run($1,$2,gen_random_uuid(),'extract')", [owner, projectId])).rejects.toThrow(/unique/);
    await db.exec("update space_analysis_runs set created_at=now()-interval '4 minutes'");
    const stale = await db.query<{ result: { acquired: boolean; run: { status: string } } }>("select public.space_reserve_run($1,$2,$3,'extract') result", [owner, projectId, request]);
    expect(stale.rows[0].result.acquired).toBe(false); expect(stale.rows[0].result.run.status).toBe("failed");
  });
  it("commits scene/run atomically and prevents concurrent stale applied-change writes", async () => {
    const scene = manualScene(); scene.confirmed = true; scene.orientation.confirmed = true;
    const result = analyzeSpace(scene, "rest", "en");
    const lease = await db.query<{ result: { run: { id: string } } }>("select public.space_reserve_run($1,$2,gen_random_uuid(),'analyze') result", [owner, projectId]); const run = lease.rows[0].result.run.id;
    await db.query("select public.space_finish_analysis($1,$2,$3,$4)", [owner, projectId, run, JSON.stringify(result)]);
    expect((await db.query("select * from space_rooms")).rows).toHaveLength(1);
    await db.query("select public.space_save_change($1,$2,$3,0,'rec_1',true)", [owner, projectId, run]);
    await expect(db.query("select public.space_save_change($1,$2,$3,0,'rec_2',true)", [owner, projectId, run])).rejects.toThrow("change conflict");
    expect((await db.query("select * from space_applied_changes")).rows).toHaveLength(1);
  });
  it("keeps cleanup paths unreadable to account users", async () => { await asOwner(owner); await expect(db.query("select * from space_cleanup_queue")).rejects.toThrow(/permission denied/); await admin(); });
  it("preserves existing PPI counters after bulk deletion of linked third-party evidence", async () => {
    await admin();
    const hypotheses = await db.query<{ id: string }>("insert into pattern_hypotheses(owner_user_id,source_system,source_reference,life_domain,hypothesis_type,hypothesis_text,current_confidence) values($1,'user_reported','synthetic-test','work','test','Synthetic hypothesis',0.8) returning id", [owner]);
    const hypothesis = hypotheses.rows[0].id;
    const events = await db.query<{ id: string; subject: string }>("insert into evidence_events(owner_user_id,client_request_id,event_type,life_domain,event_date,short_description,subject) values($1,'event-deleted-001','test','work','2026-09-01','Synthetic removable event','third_party'),($1,'event-retained-001','test','work','2026-09-01','Synthetic retained event','owner') returning id,subject", [owner]);
    const second = await db.query<{ id: string }>("insert into evidence_events(owner_user_id,client_request_id,event_type,life_domain,event_date,short_description,subject) values($1,'event-deleted-002','test','work','2026-09-01','Synthetic second removable event','third_party') returning id", [owner]);
    const deleted = events.rows.find(r => r.subject === "third_party")!.id, retained = events.rows.find(r => r.subject === "owner")!.id;
    await db.query("insert into evidence_hypothesis_links values($1,$2,$3,'SUPPORT',now()),($1,$4,$3,'AMBIGUOUS',now())", [owner, deleted, hypothesis, retained]);
    await db.query("insert into evidence_hypothesis_links values($1,$2,$3,'SUPPORT',now())", [owner, second.rows[0].id, hypothesis]);
    await db.query("insert into pattern_reality_checks(owner_user_id,hypothesis_id,client_request_id,response) values($1,$2,'check-partial-001','PARTIAL'),($1,$2,'check-context-001','CONTEXT_DEPENDENT')", [owner, hypothesis]);
    await db.query("insert into confidence_revisions(owner_user_id,hypothesis_id,previous_confidence,new_confidence,reason,triggering_evidence_id) values($1,$2,0.45,0.8,'test',$3)", [owner, hypothesis, deleted]);
    await db.query("insert into pattern_graph_edges(owner_user_id,source_node_type,source_node_id,target_node_type,target_node_id,relationship_type) values($1,'evidence',$2,'hypothesis',$3,'support')", [owner, deleted, hypothesis]);
    await asOwner(other); await db.query("delete from evidence_events where id=$1", [deleted]);
    await admin(); expect((await db.query("select * from evidence_events where id=$1", [deleted])).rows).toHaveLength(1);
    await asOwner(owner); await db.query("select public.delete_account_data('delete-third-party-space-001','third_party')"); await admin();
    expect((await db.query("select * from confidence_revisions where triggering_evidence_id=$1", [deleted])).rows).toHaveLength(0);
    expect((await db.query("select * from pattern_graph_edges where source_node_id=$1", [deleted])).rows).toHaveLength(0);
    expect((await db.query("select * from evidence_events where id=$1", [retained])).rows).toHaveLength(1);
    const state = await db.query("select current_confidence,evidence_count,support_count,contradiction_count,ambiguous_count,uncertainty_count,provenance from pattern_hypotheses where id=$1", [hypothesis]);
    expect(state.rows[0]).toMatchObject({ current_confidence: '0.450', evidence_count: 3, support_count: 1, contradiction_count: 0, ambiguous_count: 2, uncertainty_count: 2, provenance: { evidenceDeletionReevaluationRequired: true } });
  });
  it("deletes all owner space rows atomically and queues private blobs, leaving other owner untouched", async () => {
    const otherProject = await db.query("select public.space_create_project($1,'Other room','rest','en')", [other]); expect(otherProject.rows).toHaveLength(1);
    await asOwner(owner);
    await db.query("select public.delete_account_data('delete-space-test-0001','all_data')");
    expect((await db.query("select * from space_projects")).rows).toHaveLength(0);
    await admin(); for (const table of ["pattern_hypotheses", "pattern_reality_checks", "evidence_events", "confidence_revisions", "pattern_graph_edges", "space_template_selections", "space_template_corrections"]) expect((await db.query(`select * from ${table} where owner_user_id=$1`, [owner])).rows).toHaveLength(0); expect((await db.query("select * from space_assets")).rows).toHaveLength(0); expect((await db.query("select * from space_cleanup_queue")).rows).toHaveLength(6);
    expect((await db.query("select * from space_projects where owner_user_id=$1", [other])).rows).toHaveLength(1);
  });
});
