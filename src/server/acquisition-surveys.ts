import type { SupabaseClient } from "@supabase/supabase-js";
import type { AcquisitionSource, AcquisitionSurveyInput } from "@/core/acquisition-survey";

export type StoredAcquisitionSurvey = Readonly<{
  id: string;
  order_id: string;
  owner_user_id?: string | null;
  source: AcquisitionSource;
  detail: string;
  created_at: string;
}>;

export type AcquisitionSurveyQuery<T> = Readonly<{ available: boolean; data: T }>;

export async function findAcquisitionSurveyByOrderId(
  admin: SupabaseClient,
  orderId: string,
): Promise<AcquisitionSurveyQuery<StoredAcquisitionSurvey | null>> {
  const { data, error } = await admin
    .from("report_acquisition_surveys")
    .select("id,order_id,owner_user_id,source,detail,created_at")
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) return { available: false, data: null };
  return { available: true, data: (data as StoredAcquisitionSurvey | null) ?? null };
}

export async function saveAcquisitionSurvey(
  admin: SupabaseClient,
  orderId: string,
  survey: AcquisitionSurveyInput,
  ownerUserId?: string,
): Promise<Readonly<{ ok: boolean }>> {
  const { error } = await admin.from("report_acquisition_surveys").upsert({
    order_id: orderId,
    owner_user_id: ownerUserId ?? null,
    source: survey.source,
    detail: survey.detail,
    updated_at: new Date().toISOString(),
  }, { onConflict: "order_id" });
  return { ok: !error };
}

export async function listAcquisitionSurveys(
  admin: SupabaseClient,
  limit = 100,
): Promise<AcquisitionSurveyQuery<readonly StoredAcquisitionSurvey[]>> {
  const { data, error } = await admin
    .from("report_acquisition_surveys")
    .select("id,order_id,owner_user_id,source,detail,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { available: false, data: [] };
  return { available: true, data: (data ?? []) as StoredAcquisitionSurvey[] };
}

export function summarizeAcquisitionSources(rows: readonly StoredAcquisitionSurvey[]) {
  const counts = new Map<AcquisitionSource, number>();
  for (const row of rows) counts.set(row.source, (counts.get(row.source) ?? 0) + 1);
  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((left, right) => right.count - left.count || left.source.localeCompare(right.source));
}
