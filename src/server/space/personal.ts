import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { PaidReadingInputSchema } from "@/core/paid-reading";
import { describeIntegratedNumber } from "@/core/profile/integrated-profile";
import { buildSajuChart } from "@/core/saju";
import { getOwnedReportSection } from "@/server/pattern-intelligence";
import type { PersonalContext } from "@/core/space/engine";
import { SpaceError } from "./access";

export async function spacePersonalContext(admin: SupabaseClient, client: SupabaseClient, owner: string, reportId: string | null, usePatterns: boolean, locale: "ko" | "en"): Promise<PersonalContext> {
  const context: PersonalContext = { sources: [], systems: [], confirmedChecks: 0, mismatchCount: 0, symbolicBasis: [] };
  const ko = locale === "ko";
  if (reportId) {
    const owned = await getOwnedReportSection({ admin, ownerUserId: owner, orderId: reportId, sectionIndex: 0 });
    if (!owned) throw new SpaceError("REPORT_NOT_FOUND", 404);
    context.sources.push(owned.sourceReference); context.systems.push(owned.sourceSystem);
    if (owned.sourceSystem === "numerology") {
      const number = z.union([z.number().int().min(1).max(9), z.literal(11), z.literal(22), z.literal(33)]).safeParse(owned.report.calculationBasis?.lifePath);
      if (number.success) {
        // Reuse the stored canonical number and existing interpretation mapping. No AI calculation.
        const description = describeIntegratedNumber(number.data, locale);
        context.symbolicBasis!.push(ko ? `기존 리포트의 라이프 패스 ${number.data}: ${description.label}` : `Stored Life Path ${number.data}: ${description.label}`);
      }
    } else {
      const row = await admin.from("purchased_reports").select("input").eq("order_id", reportId).eq("owner_user_id", owner).eq("status", "ready").maybeSingle();
      const parsed = PaidReadingInputSchema.safeParse(row.data?.input);
      if (!row.error && parsed.success) {
        const input = parsed.data;
        // Exact existing deterministic saju entry point; never mutate the historical report.
        const chart = buildSajuChart({ birthDate: input.birthDate, birthTime: input.birthTime, sex: input.gender === "male" ? "male" : "female", midnightConvention: input.midnightConvention ?? "야자시" });
        if (owned.report.contentReferences?.includes(`saju-rule:${chart.ruleVersion}`)) {
          context.symbolicBasis!.push(ko ? `기존 사주 규칙 ${chart.ruleVersion}: 일간 오행 ${chart.dayMasterPhase}` : `Existing saju rule ${chart.ruleVersion}: day-master phase ${chart.dayMasterPhase}`);
        }
      }
    }
  }
  if (usePatterns) {
    const rows = await client.from("pattern_reality_checks").select("id,response").eq("owner_user_id", owner).order("created_at", { ascending: false }).limit(20);
    if (rows.error) throw new SpaceError("PATTERN_UNAVAILABLE", 503);
    context.confirmedChecks = rows.data.length;
    context.mismatchCount = rows.data.filter(row => row.response === "MISMATCH" || row.response === "CONTEXT_DEPENDENT").length;
    if (rows.data.length) { context.sources.push("owner_pattern_reality_checks_latest_20"); context.systems.push("behavioral"); }
  }
  return context;
}
