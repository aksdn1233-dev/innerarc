import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { inspectPaymentReadiness } from "@/server/payments/config";
import {
  getTossPaymentByOrderId,
  matchesTossWebhookSecret,
  sanitizeTossSnapshot,
} from "@/server/payments/toss";
import { finalizePaidReport } from "@/server/reports/paid-report";

const paymentStatusEventSchema = z.object({
  eventType: z.literal("PAYMENT_STATUS_CHANGED"),
  data: z.object({
    orderId: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/),
  }).passthrough(),
}).passthrough();

const depositEventSchema = z.object({
  orderId: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/),
  status: z.string().max(40),
  secret: z.string().min(1).max(300),
}).passthrough();

export async function POST(request: Request) {
  const transmissionId = request.headers
    .get("tosspayments-webhook-transmission-id")
    ?.trim();
  if (!transmissionId || transmissionId.length < 8 || transmissionId.length > 200) {
    return NextResponse.json({ error: "INVALID_WEBHOOK_HEADERS" }, { status: 400 });
  }

  const readiness = inspectPaymentReadiness(process.env, undefined);
  const admin = getSupabaseAdminClient();
  if (!readiness.enabled || !admin) {
    return NextResponse.json({ error: "PAYMENTS_UNAVAILABLE" }, { status: 503 });
  }
  if (readiness.config.provider !== "toss") {
    return NextResponse.json({ error: "PAYMENTS_UNAVAILABLE" }, { status: 503 });
  }

  const payload: unknown = await request.json().catch(() => null);
  const paymentStatus = paymentStatusEventSchema.safeParse(payload);
  const deposit = depositEventSchema.safeParse(payload);
  if (!paymentStatus.success && !deposit.success) {
    return NextResponse.json({ error: "UNSUPPORTED_WEBHOOK" }, { status: 400 });
  }

  const eventType = paymentStatus.success ? "PAYMENT_STATUS_CHANGED" : "DEPOSIT_CALLBACK";
  let orderId: string;
  if (paymentStatus.success) {
    orderId = paymentStatus.data.data.orderId;
  } else if (deposit.success) {
    orderId = deposit.data.orderId;
  } else {
    return NextResponse.json({ error: "UNSUPPORTED_WEBHOOK" }, { status: 400 });
  }

  const { data: duplicate } = await admin
    .from("payment_events")
    .select("transmission_id")
    .eq("transmission_id", transmissionId)
    .maybeSingle();
  if (duplicate) return NextResponse.json({ received: true, duplicate: true });

  const { data: order, error: orderError } = await admin
    .from("payment_orders")
    .select("order_id,owner_user_id,amount,currency")
    .eq("order_id", orderId)
    .maybeSingle();
  if (orderError || !order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  try {
    // General payment webhooks have no signature header, so verify by API re-query:
    // https://docs.tosspayments.com/reference/using-api/webhook-events
    const payment = await getTossPaymentByOrderId({
      secretKey: readiness.config.secretKey,
      orderId,
      signal: AbortSignal.timeout(6_000),
    });
    if (
      deposit.success &&
      !matchesTossWebhookSecret(payment.virtualAccount?.secret, deposit.data.secret)
    ) {
      return NextResponse.json({ error: "WEBHOOK_SECRET_MISMATCH" }, { status: 400 });
    }
    if (
      payment.orderId !== order.order_id ||
      payment.totalAmount !== order.amount ||
      payment.currency !== order.currency
    ) {
      return NextResponse.json({ error: "PROVIDER_RESULT_MISMATCH" }, { status: 502 });
    }

    if (order.owner_user_id) {
      const { error: applyError } = await admin.rpc("apply_verified_payment", {
        p_owner_user_id: order.owner_user_id,
        p_order_id: order.order_id,
        p_payment_key: payment.paymentKey,
        p_status: payment.status,
        p_method: payment.method ?? null,
        p_provider_snapshot: sanitizeTossSnapshot(payment),
      });
      if (applyError) throw applyError;
    } else {
      const { error: applyError } = await admin
        .from("payment_orders")
        .update({
          payment_key: payment.paymentKey,
          status: payment.status,
          method: payment.method ?? null,
          provider_snapshot: sanitizeTossSnapshot(payment),
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", order.order_id)
        .is("owner_user_id", null);
      if (applyError) throw applyError;
    }
    if (payment.status === "DONE") {
      await finalizePaidReport(admin, order.owner_user_id, order.order_id);
    }

    const { error: eventError } = await admin.from("payment_events").insert({
      transmission_id: transmissionId,
      order_id: order.order_id,
      provider: "toss",
      event_type: eventType,
      verified_status: payment.status,
    });
    if (eventError?.code !== "23505") {
      if (eventError) throw eventError;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "WEBHOOK_PROCESSING_FAILED" }, { status: 500 });
  }
}
