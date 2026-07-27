import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { isAdminEmail } from "@/server/admin-access";
import { finalizePaidReport } from "@/server/reports/paid-report";

const paramsSchema = z.object({
  orderId: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/),
});

const bodySchema = z.object({
  confirmation: z.literal("입금확인"),
}).strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const auth = await requireSupabaseUser();
  if (!auth.user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }
  if (!isAdminEmail(auth.user.email)) {
    return NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
  }

  const [params, body] = await Promise.all([
    context.params,
    request.json().catch(() => null),
  ]);
  const parsedParams = paramsSchema.safeParse(params);
  const parsedBody = bodySchema.safeParse(body);
  if (!parsedParams.success || !parsedBody.success) {
    return NextResponse.json({ error: "INVALID_CONFIRMATION" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "ADMIN_UNAVAILABLE" }, { status: 503 });
  }

  const orderId = parsedParams.data.orderId;
  const { data: order, error: orderError } = await admin
    .from("payment_orders")
    .select("order_id,owner_user_id,provider,status")
    .eq("order_id", orderId)
    .maybeSingle();
  if (orderError || !order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }
  if (order.provider !== "manual_transfer") {
    return NextResponse.json({ error: "NOT_MANUAL_TRANSFER" }, { status: 409 });
  }

  const paymentKey = `manual_${orderId}`;
  const verifiedAt = new Date().toISOString();
  if (order.status !== "DONE") {
    if (order.status !== "WAITING_FOR_DEPOSIT") {
      return NextResponse.json({ error: "ORDER_NOT_WAITING" }, { status: 409 });
    }

    if (order.owner_user_id) {
      const { error: applyError } = await admin.rpc("apply_verified_payment", {
        p_owner_user_id: order.owner_user_id,
        p_order_id: orderId,
        p_payment_key: paymentKey,
        p_status: "DONE",
        p_method: "BANK_TRANSFER",
        p_provider_snapshot: {
          source: "manual_admin_confirmation",
          verifiedAt,
          verifiedByUserId: auth.user.id,
        },
      });
      if (applyError) {
        return NextResponse.json({ error: "PAYMENT_APPLY_FAILED" }, { status: 500 });
      }
    } else {
      const { data: updated, error: updateError } = await admin
        .from("payment_orders")
        .update({
          payment_key: paymentKey,
          status: "DONE",
          method: "BANK_TRANSFER",
          provider_snapshot: {
            source: "manual_admin_confirmation",
            verifiedAt,
            verifiedByUserId: auth.user.id,
          },
          updated_at: verifiedAt,
        })
        .eq("order_id", orderId)
        .eq("status", "WAITING_FOR_DEPOSIT")
        .select("order_id")
        .maybeSingle();
      if (updateError || !updated) {
        return NextResponse.json({ error: "PAYMENT_APPLY_FAILED" }, { status: 409 });
      }
    }

    const { error: eventError } = await admin.from("payment_events").upsert({
      transmission_id: `manual-${orderId}`,
      order_id: orderId,
      provider: "manual_transfer",
      event_type: "ADMIN_DEPOSIT_CONFIRMED",
      verified_status: "DONE",
      received_at: verifiedAt,
    }, { onConflict: "transmission_id", ignoreDuplicates: true });
    if (eventError) {
      return NextResponse.json({ error: "PAYMENT_EVENT_FAILED" }, { status: 500 });
    }
  }

  try {
    await finalizePaidReport(admin, order.owner_user_id, orderId);
  } catch {
    return NextResponse.json({ error: "REPORT_FINALIZE_FAILED" }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, orderId, status: "DONE" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
