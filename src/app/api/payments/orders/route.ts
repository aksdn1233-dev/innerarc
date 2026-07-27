import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { resolvePublicAppUrl } from "@/core/site-url";
import { isLocale } from "@/i18n/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import {
  deriveTossCustomerKey,
  inspectPaymentReadiness,
  paymentProductCodes,
} from "@/server/payments/config";

const bodySchema = z.object({
  productCode: z.enum(paymentProductCodes),
  locale: z.string().refine(isLocale),
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
    return NextResponse.json({ error: "INVALID_ORDER_REQUEST" }, { status: 400 });
  }

  const readiness = inspectPaymentReadiness();
  if (!readiness.enabled) {
    return NextResponse.json({ error: "PAYMENTS_UNAVAILABLE" }, { status: 503 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "PAYMENTS_UNAVAILABLE" }, { status: 503 });
  }

  const product = readiness.config.products[parsed.data.productCode];
  const orderId = `ia_${randomUUID().replaceAll("-", "")}`;
  const { error } = await admin.from("payment_orders").insert({
    order_id: orderId,
    owner_user_id: auth.user.id,
    product_code: product.code,
    provider: "toss",
    amount: product.amount,
    currency: "KRW",
    status: "CREATED",
  });
  if (error) {
    return NextResponse.json({ error: "ORDER_CREATE_FAILED" }, { status: 500 });
  }

  const baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const locale = parsed.data.locale;
  return NextResponse.json({
    orderId,
    orderName: product.names[locale],
    amount: product.amount,
    currency: "KRW",
    clientKey: readiness.config.clientKey,
    customerKey: deriveTossCustomerKey(auth.user.id, readiness.config.customerKeySalt),
    customerEmail: auth.user.email ?? undefined,
    successUrl: new URL(`/${locale}/payments/success`, baseUrl).toString(),
    failUrl: new URL(`/${locale}/payments/fail`, baseUrl).toString(),
    methodVariantKey: readiness.config.methodVariantKey,
    agreementVariantKey: readiness.config.agreementVariantKey,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
