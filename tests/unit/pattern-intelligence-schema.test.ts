import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const migrationPath = "supabase/migrations/20260830000100_personal_pattern_intelligence_p0.sql";

describe("Personal Pattern Intelligence migration", () => {
  it("is additive and creates every P0 relationship with owner foreign keys", async () => {
    const sql = await readFile(migrationPath, "utf8");
    for (const table of [
      "pattern_profiles",
      "pattern_hypotheses",
      "pattern_reality_checks",
      "evidence_events",
      "evidence_hypothesis_links",
      "confidence_revisions",
      "pattern_graph_edges",
      "report_provenance",
      "export_provenance",
      "security_abuse_events",
      "security_incidents",
    ]) expect(sql).toContain(`create table if not exists public.${table}`);
    expect(sql).not.toMatch(/drop\s+(table|column)/i);
    expect(sql.match(/references auth\.users\(id\) on delete cascade/g)?.length).toBeGreaterThanOrEqual(9);
  });

  it("uses owner-only RLS reads and RPC-only authenticated writes", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("alter table public.pattern_hypotheses enable row level security");
    expect(sql).toContain('create policy "pattern_hypotheses_owner_select"');
    expect(sql).toContain("using ((select auth.uid()) = owner_user_id)");
    expect(sql).toContain("revoke all on table public.pattern_profiles");
    expect(sql).toContain("grant select on table public.pattern_profiles");
    const statements = sql.split(";").map((statement) => statement.trim());
    expect(
      statements.some((statement) =>
        /grant\s+(insert|update|delete|all)\b[^;]*\bto\s+authenticated\b/i.test(statement),
      ),
    ).toBe(false);
    expect(sql).toContain("grant execute on function public.record_pattern_reality_check");
    expect(sql).toContain("auth.uid()");
  });

  it("preserves confidence history, graph links, rate limits, provenance, export, and deletion", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("triggering_reality_check_id");
    expect(sql).toContain("triggering_evidence_id");
    expect(sql).toContain("reality_check_context_increases_uncertainty");
    expect(sql).toContain("confirmed_evidence_contradiction_decrease");
    expect(sql).toContain("consume_security_rate_limit");
    expect(sql).toContain("content_fingerprint");
    expect(sql).toContain("account-deletion-1.2.0");
    expect(sql).toContain("delete from public.pattern_profiles where owner_user_id = current_user_id");
  });
});

describe("pattern endpoint authorization", () => {
  it("re-reads stored reports with an exact owner filter before accepting derived feedback", async () => {
    const source = await readFile("src/server/pattern-intelligence.ts", "utf8");
    expect(source).toContain('.eq("owner_user_id", input.ownerUserId)');
    expect(source).toContain('.eq("status", "ready")');
    expect(source).not.toContain("accessToken");
  });
});
