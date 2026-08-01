import { createHash } from "node:crypto";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { inspectPaymentReadiness, isPaymentForceOpen } from "@/server/payments/config";
import {
  payAppFeedbackSchema,
  payAppMethodName,
  securePayAppValueMatches,
  toInternalPayAppStatus,
} from "@/server/payments/payapp";
import { finalizePaidReport, revokeGuestPaidReport } from "@/server/reports/paid-report";

const requestSnapshotSchema = z.object({
  requestNumber: z.string().regex(/^\d{1,30}$/),
}).passthrough();

function successResponse() {
  return new Response("SUCCESS", {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export async function POST(request: Request) {
  const forceOpen = isPaymentForceOpen(process.env);
  const readiness = inspectPaymentReadiness(
    process.env,
    undefined,
    forceOpen,
  );
  const admin = getSupabaseAdminClient();
  if (!readiness.enabled || !admin) {
    return new Response("FAIL", { status: 503 });
  }
  if (readiness.config.provider !== "payapp") {
    return new Response("FAIL", { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) return new Response("FAIL", { status: 400 });
  const raw = Object.fromEntries(
    [...form.entries()]
      .filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
  const parsed = payAppFeedbackSchema.safeParse(raw);
  if (!parsed.success) return new Response("FAIL", { status: 400 });
  const feedback = parsed.data;

  if (
    !securePayAppValueMatches(feedback.userid, readiness.config.userId) ||
    !securePayAppValueMatches(feedback.linkkey, readiness.config.linkKey) ||
    !securePayAppValueMatches(feedback.linkval, readiness.config.linkValue)
  ) {
    return new Response("FAIL", { status: 401 });
  }

  const { data: order, error: orderError } = await admin
    .from("payment_orders")
    .select("order_id,owner_user_id,provider,amount,currency,status,provider_snapshot")
    .eq("order_id", feedback.var1)
    .maybeSingle();
  const snapshot = requestSnapshotSchema.safeParse(order?.provider_snapshot);
  if (
    orderError ||
    !order ||
    order.provider !== "payapp" ||
    order.currency !== "KRW" ||
    order.amount !== Number(feedback.price) ||
    !snapshot.success ||
    snapshot.data.requestNumber !== feedback.mul_no
  ) {
    return new Response("FAIL", { status: 400 });
  }

  const internalStatus = toInternalPayAppStatus(feedback.pay_state);
  const isStalePrePaymentEvent =
    order.status === "DONE" &&
    (internalStatus === "READY" || internalStatus === "WAITING_FOR_DEPOSIT");
  const paymentKey = `payapp_request_${feedback.mul_no}`;
  const safeSnapshot = {
    requestNumber: feedback.mul_no,
    status: feedback.pay_state,
    method: payAppMethodName(feedback.pay_type),
    paidAt: feedback.pay_date || null,
    cancelledAt: feedback.canceldate || null,
    virtualAccount: feedback.pay_type === "7"
      ? {
          bank: feedback.vbank || null,
          accountNumber: feedback.vbankno || null,
          holder: feedback.depositor || null,
        }
      : null,
    verifiedAt: new Date().toISOString(),
  };

  try {
    if (!isStalePrePaymentEvent) {
      if (order.owner_user_id) {
        const { error: applyError } = await admin.rpc("apply_verified_payment", {
          p_owner_user_id: order.owner_user_id,
          p_order_id: order.order_id,
          p_payment_key: paymentKey,
          p_status: internalStatus,
          p_method: payAppMethodName(feedback.pay_type),
          p_provider_snapshot: safeSnapshot,
        });
        if (applyError) throw applyError;
      } else {
        const { error: applyError } = await admin
          .from("payment_orders")
          .update({
            payment_key: paymentKey,
            status: internalStatus,
            method: payAppMethodName(feedback.pay_type),
            provider_snapshot: safeSnapshot,
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", order.order_id)
          .is("owner_user_id", null);
        if (applyError) throw applyError;
        // A guest order has no owner row for apply_verified_payment to revoke, so a
        // cancellation or refund after delivery must withdraw report access here.
        if (order.status === "DONE" && internalStatus !== "DONE") {
          await revokeGuestPaidReport(admin, order.order_id);
        }
      }
      if (internalStatus === "DONE") {
        await finalizePaidReport(admin, order.owner_user_id, order.order_id);
      }
    }

    const transmissionId = `payapp-${createHash("sha256")
      .update([
        feedback.mul_no,
        feedback.pay_state,
        feedback.pay_date,
        feedback.canceldate,
      ].join(":"))
      .digest("hex")}`;
    const { error: eventError } = await admin.from("payment_events").insert({
      transmission_id: transmissionId,
      order_id: order.order_id,
      provider: "payapp",
      event_type: `PAY_STATE_${feedback.pay_state}`,
      verified_status: feedback.pay_state,
    });
    if (eventError?.code !== "23505" && eventError) throw eventError;
    return successResponse();
  } catch {
    return new Response("FAIL", { status: 500 });
  }
}
