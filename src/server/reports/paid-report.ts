import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaidReport } from "@/core/paid-reading";
import { PaidReadingInputSchema } from "@/core/paid-reading";
import { createBasicPaidReport } from "@/server/reports/basic-report";
import { createDetailPaidReport } from "@/server/reports/detail-report";
import { createPremiumPaidReport } from "@/server/reports/premium-report";
import { enhancePaidReport } from "@/server/reports/enhance-report";

export function createPaidReport(orderId: string, rawInput: unknown): PaidReport {
  const input = PaidReadingInputSchema.parse(rawInput);
  let report: PaidReport;
  switch (input.productCode) {
    case "plus_30d":
      report = createBasicPaidReport(orderId, input);
      break;
    case "pro_30d":
      report = createDetailPaidReport(orderId, input);
      break;
    case "premium_pdf":
      report = createPremiumPaidReport(orderId, input);
      break;
  }
  return enhancePaidReport(report, input);
}

export async function revokeGuestPaidReport(
  admin: SupabaseClient,
  orderId: string,
): Promise<void> {
  const { error } = await admin
    .from("purchased_reports")
    .update({ status: "revoked", updated_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .is("owner_user_id", null);
  if (error) throw error;
}

export async function finalizePaidReport(
  admin: SupabaseClient,
  ownerUserId: string | null,
  orderId: string,
): Promise<void> {
  let selectQuery = admin
    .from("purchased_reports")
    .select("input,status")
    .eq("order_id", orderId);
  selectQuery = ownerUserId
    ? selectQuery.eq("owner_user_id", ownerUserId)
    : selectQuery.is("owner_user_id", null);
  const { data, error } = await selectQuery.maybeSingle();
  if (error || !data) throw error ?? new Error("REPORT_DRAFT_NOT_FOUND");
  if (data.status === "ready") return;
  // A revoked report follows a cancellation or refund. The provider retries a callback
  // whose response it did not accept, so a delivery confirmation can land after the
  // money has already gone back — reopening a report the buyer no longer paid for.
  // Only a draft awaiting payment may become readable.
  if (data.status !== "pending_payment") return;

  try {
    const report = createPaidReport(orderId, data.input);
    let updateQuery = admin
      .from("purchased_reports")
      .update({
        report,
        status: "ready",
        ready_at: report.createdAt,
        updated_at: report.createdAt,
      })
      .eq("order_id", orderId)
      // Concurrent callbacks for the same order both pass the read above; the writer
      // that loses this condition changes nothing instead of writing a second time.
      .eq("status", "pending_payment");
    updateQuery = ownerUserId
      ? updateQuery.eq("owner_user_id", ownerUserId)
      : updateQuery.is("owner_user_id", null);
    const { error: updateError } = await updateQuery;
    if (updateError) throw updateError;
  } catch (error) {
    let failureQuery = admin
      .from("purchased_reports")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("order_id", orderId);
    failureQuery = ownerUserId
      ? failureQuery.eq("owner_user_id", ownerUserId)
      : failureQuery.is("owner_user_id", null);
    await failureQuery;
    throw error;
  }
}
