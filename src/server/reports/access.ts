import { createHash, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaidReport } from "@/core/paid-reading";

export type StoredReport = Readonly<{
  order_id: string;
  owner_user_id: string | null;
  guest_access_token_hash: string | null;
  status: "pending_payment" | "ready" | "failed" | "revoked";
  report: PaidReport | null;
  created_at: string;
}>;

function tokenMatches(token: string | undefined, expectedHash: string | null): boolean {
  if (!token || !expectedHash || !/^[a-f0-9]{64}$/.test(expectedHash)) return false;
  const actual = Buffer.from(createHash("sha256").update(token).digest("hex"));
  const expected = Buffer.from(expectedHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export async function getAuthorizedStoredReport(input: {
  admin: SupabaseClient;
  orderId: string;
  userId?: string;
  accessToken?: string;
}): Promise<StoredReport | null> {
  const { data, error } = await input.admin
    .from("purchased_reports")
    .select("order_id,owner_user_id,guest_access_token_hash,status,report,created_at")
    .eq("order_id", input.orderId)
    .maybeSingle();
  if (error || !data) return null;
  if (data.owner_user_id) {
    return data.owner_user_id === input.userId ? data as StoredReport : null;
  }
  return tokenMatches(input.accessToken, data.guest_access_token_hash)
    ? data as StoredReport
    : null;
}
