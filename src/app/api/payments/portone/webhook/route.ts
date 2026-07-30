import { Webhook } from "@portone/server-sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { inspectPaymentReadiness } from "@/server/payments/config";
import {
  assertPortOnePaymentMatches,
  getPortOnePayment,
  sanitizePortOneSnapshot,
  toInternalPaymentStatus,
} from "@/server/payments/portone";
import { finalizePaidReport, revokeGuestPaidReport } from "@/server/reports/paid-report";

const verifiedWebhookSchema = z.object({
  type: z.string().min(1).max(100),
  data: z.object({
    paymentId: z.string().regex(/^[A-Za-z0-9]{6,64}$/),
  }).passthrough(),
}).passthrough();

export async function POST(request: Request) {
  const readiness = inspectPaymentReadiness();
  const admin = getSupabaseAdminClient();
  if (!readiness.enabled || readiness.config.provider !== "portone" || !admin) {
    return NextResponse.json({ error: "PAYMENTS_UNAVAILABLE" }, { status: 503 });
  }

  const rawBody = await request.text();
  let verified: z.infer<typeof verifiedWebhookSchema>;
  try {
    const webhook = await Webhook.verify(
      readiness.config.webhookSecret,
      rawBody,
      {
        "webhook-id": request.headers.get("webhook-id") ?? "",
        "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
        "webhook-signature": request.headers.get("webhook-signature") ?? "",
      },
    );
    const parsed = verifiedWebhookSchema.safeParse(webhook);
    if (!parsed.success) {
      return NextResponse.json({ received: true, ignored: true });
    }
    verified = parsed.data;
  } catch {
    return NextResponse.json({ error: "INVALID_WEBHOOK_SIGNATURE" }, { status: 400 });
  }

  const transmissionId = request.headers.get("webhook-id")?.trim() ?? "";
  if (transmissionId.length < 8 || transmissionId.length > 200) {
    return NextResponse.json({ error: "INVALID_WEBHOOK_HEADERS" }, { status: 400 });
  }

  const { data: duplicate } = await admin
    .from("payment_events")
    .select("transmission_id")
    .eq("transmission_id", transmissionId)
    .maybeSingle();
  if (duplicate) return NextResponse.json({ received: true, duplicate: true });

  const { data: order, error: orderError } = await admin
    .from("payment_orders")
    .select("order_id,owner_user_id,provider,amount,currency,status")
    .eq("order_id", verified.data.paymentId)
    .maybeSingle();
  if (orderError || !order || order.provider !== "portone") {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  try {
    const payment = await getPortOnePayment({
      apiSecret: readiness.config.apiSecret,
      storeId: readiness.config.storeId,
      paymentId: verified.data.paymentId,
    });
    assertPortOnePaymentMatches({
      payment,
      paymentId: order.order_id,
      storeId: readiness.config.storeId,
      amount: order.amount,
      currency: order.currency,
    });

    const internalStatus = toInternalPaymentStatus(payment.status);
    if (order.owner_user_id) {
      const { error: applyError } = await admin.rpc("apply_verified_payment", {
        p_owner_user_id: order.owner_user_id,
        p_order_id: order.order_id,
        p_payment_key: payment.transactionId,
        p_status: internalStatus,
        p_method: payment.method?.type ?? null,
        p_provider_snapshot: sanitizePortOneSnapshot(payment),
      });
      if (applyError) throw applyError;
    } else {
      const { error: applyError } = await admin
        .from("payment_orders")
        .update({
          payment_key: payment.transactionId,
          status: internalStatus,
          method: payment.method?.type ?? null,
          provider_snapshot: sanitizePortOneSnapshot(payment),
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

    const { error: eventError } = await admin.from("payment_events").insert({
      transmission_id: transmissionId,
      order_id: order.order_id,
      provider: "portone",
      event_type: verified.type,
      verified_status: payment.status,
    });
    if (eventError?.code !== "23505" && eventError) throw eventError;

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "WEBHOOK_PROCESSING_FAILED" }, { status: 500 });
  }
}
