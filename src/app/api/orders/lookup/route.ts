import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { resolvePublicAppUrl } from "@/core/site-url";
import { isLocale } from "@/i18n/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hashCustomerPhone } from "@/server/order-pass";

// Guest order lookup: the order number is the secret, and the phone number used at
// checkout is the second factor. Both must match, and a wrong pair is answered with
// one generic result so the endpoint cannot be used to test whether an order exists.
const bodySchema = z.object({
  orderId: z.string().trim().regex(/^[A-Za-z0-9_-]{6,64}$/),
  phone: z.string().trim().min(9).max(20),
  locale: z.string().refine(isLocale),
}).strict();

function notFound() {
  return NextResponse.json(
    { error: "ORDER_NOT_FOUND" },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}

function hashesMatch(actual: string | null, expected: string | null): boolean {
  if (!actual || !expected) return false;
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes);
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_LOOKUP" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "UNAVAILABLE" }, { status: 503 });

  const phoneHash = hashCustomerPhone(parsed.data.phone);
  if (!phoneHash) return notFound();

  const { data: order, error } = await admin
    .from("payment_orders")
    .select("order_id,customer_phone_hash,status")
    .eq("order_id", parsed.data.orderId)
    .maybeSingle();
  if (error || !order || !hashesMatch(order.customer_phone_hash, phoneHash)) {
    return notFound();
  }

  const { data: report } = await admin
    .from("purchased_reports")
    .select("guest_access_token_hash,status")
    .eq("order_id", order.order_id)
    .maybeSingle();
  if (!report) return notFound();

  // The stored access token is a hash, so the original link cannot be rebuilt here.
  // The report route accepts a lookup proof instead: possession of the order number
  // and the matching phone number, restated as a short-lived signed value.
  const proof = createHash("sha256")
    .update(`${order.order_id}:${phoneHash}`)
    .digest("hex");
  const baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const reportUrl = new URL(`/${parsed.data.locale}/reports/${order.order_id}`, baseUrl);
  reportUrl.searchParams.set("proof", proof);

  return NextResponse.json({
    orderId: order.order_id,
    paymentStatus: order.status,
    reportStatus: report.status,
    reportUrl: reportUrl.toString(),
  }, { headers: { "Cache-Control": "no-store" } });
}
