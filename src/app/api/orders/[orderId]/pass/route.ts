import { NextResponse } from "next/server";
import { resolvePublicAppUrl } from "@/core/site-url";
import { isLocale } from "@/i18n/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import {
  ORDER_PASS_COOKIE,
  issueOrderPass,
  orderPassMaxAgeSeconds,
  tierForProduct,
} from "@/server/order-pass";
import { getAuthorizedStoredReport } from "@/server/reports/access";

// Turns proven ownership of a completed order into the pass that gates the larger
// features. The caller must already be able to open the report itself, so this adds
// no new way in; it only carries that proof forward to the rest of the site.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "ko";
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(orderId) || !isLocale(locale)) {
    return NextResponse.json({ error: "INVALID_ORDER" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "UNAVAILABLE" }, { status: 503 });

  const auth = await requireSupabaseUser();
  const stored = await getAuthorizedStoredReport({
    admin,
    orderId,
    userId: auth.user?.id,
    accessToken: url.searchParams.get("access") ?? undefined,
    lookupProof: url.searchParams.get("proof") ?? undefined,
  });
  if (!stored || stored.status !== "ready") {
    return NextResponse.json({ error: "REPORT_NOT_FOUND" }, { status: 404 });
  }

  const { data: order } = await admin
    .from("payment_orders")
    .select("product_code,status")
    .eq("order_id", orderId)
    .maybeSingle();
  const tier = order?.status === "DONE" ? tierForProduct(order.product_code) : null;
  if (!tier) return NextResponse.json({ error: "ORDER_NOT_PAID" }, { status: 409 });

  const pass = issueOrderPass({ orderId, tier, now: new Date() });
  if (!pass) return NextResponse.json({ error: "UNAVAILABLE" }, { status: 503 });

  const destination = url.searchParams.get("next") === "compatibility"
    ? `/${locale}/compatibility`
    : `/${locale}/reports/${orderId}`;
  const response = NextResponse.redirect(
    new URL(destination, resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL)),
    303,
  );
  response.cookies.set(ORDER_PASS_COOKIE, pass, {
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    path: "/",
    maxAge: orderPassMaxAgeSeconds,
  });
  return response;
}
