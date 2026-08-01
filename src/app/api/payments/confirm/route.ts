import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { inspectPaymentReadiness } from "@/server/payments/config";
import {
  assertPortOnePaymentMatches,
  getPortOnePayment,
  PortOneApiError,
  sanitizePortOneSnapshot,
  toInternalPaymentStatus,
} from "@/server/payments/portone";
import { finalizePaidReport } from "@/server/reports/paid-report";
import {
  confirmTossPayment,
  sanitizeTossSnapshot,
  TossApiError,
} from "@/server/payments/toss";

const accessToken = z.string().min(32).max(100).optional();
const bodySchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal("toss"),
    paymentKey: z.string().min(10).max(300),
    orderId: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/),
    amount: z.number().int().min(100).max(10_000_000),
    accessToken,
  }).strict(),
  z.object({
    provider: z.literal("portone"),
    paymentId: z.string().regex(/^[A-Za-z0-9]{6,64}$/),
    accessToken,
  }).strict(),
]);

function guestTokenMatches(token: string | undefined, expectedHash: string | null): boolean {
  if (!token || !expectedHash || !/^[a-f0-9]{64}$/.test(expectedHash)) return false;
  const actual = Buffer.from(createHash("sha256").update(token).digest("hex"));
  const expected = Buffer.from(expectedHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const auth = await requireSupabaseUser();
  if (auth.error === "SUPABASE_DISABLED") {
    return NextResponse.json({ error: auth.error }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_CONFIRM_REQUEST" }, { status: 400 });
  }

  const readiness = inspectPaymentReadiness(process.env, undefined);
  const admin = getSupabaseAdminClient();
  if (!readiness.enabled || !admin) {
    return NextResponse.json({ error: "PAYMENTS_UNAVAILABLE" }, { status: 503 });
  }
  if (readiness.config.provider !== parsed.data.provider) {
    return NextResponse.json({ error: "PAYMENT_PROVIDER_MISMATCH" }, { status: 409 });
  }

  const orderId = parsed.data.provider === "toss"
    ? parsed.data.orderId
    : parsed.data.paymentId;
  const { data: order, error: orderError } = await admin
    .from("payment_orders")
    .select("order_id,owner_user_id,guest_access_token_hash,provider,amount,currency,status,payment_key")
    .eq("order_id", orderId)
    .maybeSingle();
  if (orderError || !order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }
  if (order.provider !== parsed.data.provider) {
    return NextResponse.json({ error: "PAYMENT_PROVIDER_MISMATCH" }, { status: 409 });
  }

  const ownerAuthorized = order.owner_user_id !== null && auth.user?.id === order.owner_user_id;
  const guestAuthorized = order.owner_user_id === null &&
    guestTokenMatches(parsed.data.accessToken, order.guest_access_token_hash);
  if (!ownerAuthorized && !guestAuthorized) {
    return NextResponse.json({ error: "PAYMENT_ACCESS_DENIED" }, { status: 403 });
  }
  const verifiedOrder = order;

  async function applyVerifiedPayment(input: {
    paymentKey: string;
    status: string;
    method: string | null;
    snapshot: Record<string, unknown>;
  }) {
    if (verifiedOrder.owner_user_id) {
      const applied = await admin!.rpc("apply_verified_payment", {
        p_owner_user_id: verifiedOrder.owner_user_id,
        p_order_id: verifiedOrder.order_id,
        p_payment_key: input.paymentKey,
        p_status: input.status,
        p_method: input.method,
        p_provider_snapshot: input.snapshot,
      });
      if (applied.error) throw applied.error;
      return applied.data;
    }
    const updated = await admin!
      .from("payment_orders")
      .update({
        payment_key: input.paymentKey,
        status: input.status,
        method: input.method,
        provider_snapshot: input.snapshot,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", verifiedOrder.order_id)
      .is("owner_user_id", null);
    if (updated.error) throw updated.error;
    return { orderId: verifiedOrder.order_id, status: input.status };
  }

  if (parsed.data.provider === "portone" && readiness.config.provider === "portone") {
    try {
      const payment = await getPortOnePayment({
        apiSecret: readiness.config.apiSecret,
        storeId: readiness.config.storeId,
        paymentId: parsed.data.paymentId,
      });
      assertPortOnePaymentMatches({
        payment,
        paymentId: order.order_id,
        storeId: readiness.config.storeId,
        amount: order.amount,
        currency: order.currency,
      });
      const paymentStatus = toInternalPaymentStatus(payment.status);
      const paymentMethod = typeof payment.method?.type === "string"
        ? payment.method.type
        : null;
      const data = await applyVerifiedPayment({
        paymentKey: payment.transactionId,
        status: paymentStatus,
        method: paymentMethod,
        snapshot: sanitizePortOneSnapshot(payment),
      });
      let reportStatus = paymentStatus === "DONE" ? "ready" : "pending_payment";
      if (paymentStatus === "DONE") {
        try {
          await finalizePaidReport(admin, order.owner_user_id, order.order_id);
        } catch {
          reportStatus = "failed";
        }
      }
      return NextResponse.json({ payment: data, reportStatus }, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      return NextResponse.json({
        error: "PAYMENT_CONFIRM_FAILED",
        ...(error instanceof PortOneApiError ? { providerCode: error.code } : {}),
      }, { status: 502 });
    }
  }

  if (parsed.data.provider !== "toss" || readiness.config.provider !== "toss") {
    return NextResponse.json({ error: "PAYMENT_PROVIDER_MISMATCH" }, { status: 409 });
  }
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
    const data = await applyVerifiedPayment({
      paymentKey: payment.paymentKey,
      status: payment.status,
      method: payment.method ?? null,
      snapshot: sanitizeTossSnapshot(payment),
    });
    let reportStatus = payment.status === "DONE" ? "ready" : "pending_payment";
    if (payment.status === "DONE") {
      try {
        await finalizePaidReport(admin, order.owner_user_id, order.order_id);
      } catch {
        reportStatus = "failed";
      }
    }
    return NextResponse.json({ payment: data, reportStatus }, {
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
