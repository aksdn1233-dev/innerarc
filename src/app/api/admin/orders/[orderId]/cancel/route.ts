import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { isAdminEmail } from "@/server/admin-access";
import { inspectPaymentReadiness } from "@/server/payments/config";
import { cancelPayAppPayment } from "@/server/payments/payapp";

// Cancelling moves real money, so this asks the provider to do it and then reports
// exactly what the provider said. It deliberately does not mark the order cancelled
// itself: the PayApp feedback callback is the single writer of payment state, which
// keeps one source of truth and revokes the report on its own.
const bodySchema = z.object({
  confirmation: z.literal("결제취소"),
  reason: z.string().trim().min(2).max(200),
}).strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const auth = await requireSupabaseUser();
  if (!auth.user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  if (!isAdminEmail(auth.user.email)) {
    return NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
  }

  const [params, body] = await Promise.all([context.params, request.json().catch(() => null)]);
  const parsedBody = bodySchema.safeParse(body);
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(params.orderId) || !parsedBody.success) {
    return NextResponse.json({ error: "INVALID_CONFIRMATION" }, { status: 400 });
  }

  const readiness = inspectPaymentReadiness(process.env, undefined);
  const admin = getSupabaseAdminClient();
  if (!readiness.enabled || !admin) {
    return NextResponse.json({ error: "PROVIDER_UNAVAILABLE" }, { status: 503 });
  }
  if (readiness.config.provider !== "payapp") {
    return NextResponse.json({ error: "PROVIDER_UNAVAILABLE" }, { status: 503 });
  }

  const { data: order } = await admin
    .from("payment_orders")
    .select("order_id,provider,status,provider_snapshot")
    .eq("order_id", params.orderId)
    .maybeSingle();
  if (!order || order.provider !== "payapp") {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }
  if (order.status === "CANCELED") {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }
  const snapshot = order.provider_snapshot as { requestNumber?: unknown } | null;
  const requestNumber = typeof snapshot?.requestNumber === "string"
    ? snapshot.requestNumber
    : null;
  if (!requestNumber) {
    return NextResponse.json({ error: "NO_PROVIDER_REQUEST" }, { status: 409 });
  }

  const result = await cancelPayAppPayment({
    userId: readiness.config.userId,
    linkKey: readiness.config.linkKey,
    requestNumber,
    memo: parsedBody.data.reason,
  });
  if (!result.ok) {
    // Surfaced verbatim: a refund that silently fails is worse than a visible error.
    return NextResponse.json(
      { error: "PROVIDER_REJECTED", providerMessage: result.message },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { ok: true, orderId: order.order_id },
    { headers: { "Cache-Control": "no-store" } },
  );
}
