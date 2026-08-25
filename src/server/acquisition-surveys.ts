import type { SupabaseClient } from "@supabase/supabase-js";
import {
  decodeAcquisitionSurvey,
  encodeAcquisitionSurvey,
  type AcquisitionSource,
  type AcquisitionSurveyAnswers,
  type AcquisitionSurveyInput,
} from "@/core/acquisition-survey";

type StoredAcquisitionSurveyRow = Readonly<{
  id: string;
  order_id: string;
  owner_user_id?: string | null;
  source: AcquisitionSource;
  detail: string;
  created_at: string;
}>;

export type StoredAcquisitionSurvey = Omit<StoredAcquisitionSurveyRow, "detail"> & AcquisitionSurveyAnswers;

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
  const row = data as StoredAcquisitionSurveyRow | null;
  return { available: true, data: row ? normalizeAcquisitionSurvey(row) : null };
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
    detail: encodeAcquisitionSurvey(survey),
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
  return {
    available: true,
    data: ((data ?? []) as StoredAcquisitionSurveyRow[]).map(normalizeAcquisitionSurvey),
  };
}

function normalizeAcquisitionSurvey(row: StoredAcquisitionSurveyRow): StoredAcquisitionSurvey {
  return {
    id: row.id,
    order_id: row.order_id,
    owner_user_id: row.owner_user_id,
    created_at: row.created_at,
    ...decodeAcquisitionSurvey(row.source, row.detail),
  };
}

export function summarizeAcquisitionSources(rows: readonly StoredAcquisitionSurvey[]) {
  const counts = new Map<AcquisitionSource, number>();
  for (const row of rows) counts.set(row.source, (counts.get(row.source) ?? 0) + 1);
  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((left, right) => right.count - left.count || left.source.localeCompare(right.source));
}
