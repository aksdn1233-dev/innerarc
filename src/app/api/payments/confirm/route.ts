import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { inspectPaymentReadiness } from "@/server/payments/config";
import {
  confirmTossPayment,
  sanitizeTossSnapshot,
  TossApiError,
} from "@/server/payments/toss";

const bodySchema = z.object({
  paymentKey: z.string().min(10).max(300),
  orderId: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/),
  amount: z.number().int().min(100).max(10_000_000),
}).strict();

export async function POST(request: Request) {
  const auth = await requireSupabaseUser();
  if (auth.error || !auth.user) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.error === "AUTH_REQUIRED" ? 401 : 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_CONFIRM_REQUEST" }, { status: 400 });
  }

  const readiness = inspectPaymentReadiness();
  const admin = getSupabaseAdminClient();
  if (!readiness.enabled || !admin) {
    return NextResponse.json({ error: "PAYMENTS_UNAVAILABLE" }, { status: 503 });
  }

  const { data: order, error: orderError } = await admin
    .from("payment_orders")
    .select("order_id,owner_user_id,amount,currency,status,payment_key")
    .eq("order_id", parsed.data.orderId)
    .eq("owner_user_id", auth.user.id)
    .maybeSingle();
  if (orderError || !order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }
  // Toss Payments requires the successUrl amount to match the server-owned order:
  // https://docs.tosspayments.com/guides/v2/get-started/llms-quick-reference
  if (order.amount !== parsed.data.amount || order.currency !== "KRW") {
    return NextResponse.json({ error: "AMOUNT_MISMATCH" }, { status: 400 });
  }
  if (order.payment_key && order.payment_key !== parsed.data.paymentKey) {
    return NextResponse.json({ error: "PAYMENT_KEY_MISMATCH" }, { status: 409 });
  }

  try {
    const payment = await confirmTossPayment({
      secretKey: readiness.config.secretKey,
      paymentKey: parsed.data.paymentKey,
      orderId: parsed.data.orderId,
      amount: parsed.data.amount,
      signal: AbortSignal.timeout(8_000),
    });
    if (
      payment.orderId !== order.order_id ||
      payment.totalAmount !== order.amount ||
      payment.currency !== order.currency
    ) {
      return NextResponse.json({ error: "PROVIDER_RESULT_MISMATCH" }, { status: 502 });
    }

    const { data, error } = await admin.rpc("apply_verified_payment", {
      p_owner_user_id: auth.user.id,
      p_order_id: order.order_id,
      p_payment_key: payment.paymentKey,
      p_status: payment.status,
      p_method: payment.method ?? null,
      p_provider_snapshot: sanitizeTossSnapshot(payment),
    });
    if (error) throw error;

    return NextResponse.json({ payment: data }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof TossApiError) {
      return NextResponse.json(
        { error: "PAYMENT_CONFIRM_FAILED", providerCode: error.providerCode },
        { status: error.status >= 500 ? 502 : 400 },
      );
    }
    return NextResponse.json({ error: "PAYMENT_CONFIRM_FAILED" }, { status: 500 });
  }
}
