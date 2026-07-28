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

/**
 * A buyer who lost their original link can prove ownership with the order number and
 * the phone number used at checkout. Order lookup restates that pair as this value;
 * the stored access token is a hash, so the original link cannot be reconstructed.
 */
async function lookupProofMatches(
  admin: SupabaseClient,
  orderId: string,
  proof: string | undefined,
): Promise<boolean> {
  if (!proof || !/^[a-f0-9]{64}$/.test(proof)) return false;
  const { data } = await admin
    .from("payment_orders")
    .select("customer_phone_hash")
    .eq("order_id", orderId)
    .maybeSingle();
  const phoneHash: string | null = data?.customer_phone_hash ?? null;
  if (!phoneHash) return false;
  const expected = Buffer.from(
    createHash("sha256").update(`${orderId}:${phoneHash}`).digest("hex"),
  );
  const actual = Buffer.from(proof);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function getAuthorizedStoredReport(input: {
  admin: SupabaseClient;
  orderId: string;
  userId?: string;
  accessToken?: string;
  lookupProof?: string;
  /** Order id proven by a signed return ticket or order pass held by this browser. */
  provenOrderId?: string;
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
  if (tokenMatches(input.accessToken, data.guest_access_token_hash)) {
    return data as StoredReport;
  }
  // Only ever set from a signature this server issued for this exact order.
  if (input.provenOrderId && input.provenOrderId === input.orderId) {
    return data as StoredReport;
  }
  return await lookupProofMatches(input.admin, input.orderId, input.lookupProof)
    ? data as StoredReport
    : null;
}
