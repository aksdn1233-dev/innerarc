import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const migrationPath = "supabase/migrations/20260821000100_versioned_saju_foundation.sql";

describe("versioned Saju persistence foundation", () => {
  it("keeps calculation history, generated content, jobs, and costs separate", async () => {
    const sql = await readFile(migrationPath, "utf8");
    for (const table of [
      "saju_profiles", "saju_charts", "saju_chart_versions", "saju_interpretations",
      "saju_generation_jobs", "ai_cost_events", "saju_recalculation_audit",
    ]) {
      expect(sql).toContain(`public.${table}`);
    }
    expect(sql).toContain("canonical_result jsonb not null");
    expect(sql).toContain("calculation_policy_version text not null");
    expect(sql).toContain("unique (owner_user_id, idempotency_key)");
  });

  it("owner-scopes profiles and exposes immutable artifacts as read-only", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain('create policy "saju_profiles_owner_all"');
    expect(sql).toContain('create policy "saju_chart_versions_owner_select"');
    expect(sql).not.toMatch(/grant (insert|update|delete)[^;]+saju_chart_versions to authenticated/i);
    expect(sql).toContain("references auth.users(id) on delete cascade");
  });

  it("documents a reversible rollback without touching payment tables", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("Manual rollback reference");
    expect(sql).not.toMatch(/alter table public\.payment_orders/);
    expect(sql).not.toMatch(/drop table public\.payment/);
  });
});
