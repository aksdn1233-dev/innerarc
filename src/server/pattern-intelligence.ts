import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaidReport } from "@/core/paid-reading";

export type OwnedReportSection = Readonly<{
  report: PaidReport;
  section: PaidReport["sections"][number];
  sourceReference: string;
  sourceSystem: "saju" | "numerology";
}>;

export function inferReportSourceSystem(report: PaidReport): "saju" | "numerology" {
  return report.contentVersion?.startsWith("saju-chart-") ? "saju" : "numerology";
}

export async function getOwnedReportSection(input: {
  admin: SupabaseClient;
  ownerUserId: string;
  orderId: string;
  sectionIndex: number;
}): Promise<OwnedReportSection | null> {
  const { data, error } = await input.admin
    .from("purchased_reports")
    .select("order_id,owner_user_id,status,report")
    .eq("order_id", input.orderId)
    .eq("owner_user_id", input.ownerUserId)
    .eq("status", "ready")
    .maybeSingle();
  if (error || !data?.report) return null;
  const report = data.report as PaidReport;
  const section = report.sections[input.sectionIndex];
  if (!section) return null;
  return {
    report,
    section,
    sourceReference: `report:${input.orderId}:section:${input.sectionIndex}`,
    sourceSystem: inferReportSourceSystem(report),
  };
}

export function inferLifeDomain(title: string): string {
  const normalized = title.toLocaleLowerCase("ko-KR");
  if (/관계|연애|사랑|relationship|love/.test(normalized)) return "relationship";
  if (/일|직업|커리어|사업|work|career|business/.test(normalized)) return "work";
  if (/돈|재정|투자|money|finance/.test(normalized)) return "money";
  if (/가족|family/.test(normalized)) return "family";
  if (/건강|생활|health|lifestyle/.test(normalized)) return "health_lifestyle";
  if (/성장|growth/.test(normalized)) return "growth";
  return "other";
}
