import { NextResponse } from "next/server";
import { z } from "zod";
import { resolvePublicAppUrl } from "@/core/site-url";
import { isLocale } from "@/i18n/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  ORDER_PASS_COOKIE,
  issueOrderPass,
  orderPassMaxAgeSeconds,
  readOrderTicket,
  tierForProduct,
} from "@/server/order-pass";

const returnSchema = z.object({
  locale: z.string().refine(isLocale),
  orderId: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/),
  rt: z.string().max(300).optional(),
});

/**
 * Where the payment provider drops the buyer after checkout. The signed ticket handed
 * out at order creation comes back here, so the report can open straight away instead
 * of depending on browser storage the payment app may not have carried over.
 */
async function returnToReport(request: Request) {
  const requestUrl = new URL(request.url);
  const parsed = returnSchema.safeParse(Object.fromEntries(requestUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_RETURN" }, { status: 400 });
  }
  const { locale, orderId } = parsed.data;
  let baseUrl: URL;
  try {
    baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  } catch {
    baseUrl = new URL(requestUrl.origin + "/");
  }
  const now = new Date();
  const ticketOrderId = readOrderTicket(parsed.data.rt, now);

  // Without a valid ticket, fall back to the client hand-off, which can still recover
  // the link from this browser or explain how to find the order.
  if (ticketOrderId !== orderId) {
    const handoff = new URL(`/${locale}/payments/payapp-return`, baseUrl);
    handoff.searchParams.set("orderId", orderId);
    return NextResponse.redirect(handoff, 303);
  }

  const destination = new URL(`/${locale}/reports/${orderId}`, baseUrl);
  destination.searchParams.set("t", parsed.data.rt as string);
  const response = NextResponse.redirect(destination, 303);

  // Also remember the purchase in this browser, so the larger features and later
  // visits work without re-entering anything. The tier stays "none" until the
  // provider's own callback confirms the payment.
  const admin = getSupabaseAdminClient();
  if (admin) {
    const { data: order } = await admin
      .from("payment_orders")
      .select("product_code,status")
      .eq("order_id", orderId)
      .maybeSingle();
    const tier = order?.status === "DONE"
      ? tierForProduct(order.product_code) ?? "none"
      : "none";
    const pass = issueOrderPass({ orderId, tier, now });
    if (pass) {
      response.cookies.set(ORDER_PASS_COOKIE, pass, {
        httpOnly: true,
        sameSite: "lax",
        secure: requestUrl.protocol === "https:",
        path: "/",
        maxAge: orderPassMaxAgeSeconds,
      });
    }
  }
  return response;
}

export async function GET(request: Request) {
  return returnToReport(request);
}

export async function POST(request: Request) {
  return returnToReport(request);
}
