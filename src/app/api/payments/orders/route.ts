import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { resolvePublicAppUrl } from "@/core/site-url";
import { isLocale } from "@/i18n/config";
import { PaidReadingInputSchema } from "@/core/paid-reading";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import {
  deriveTossCustomerKey,
  inspectPaymentReadiness,
  paymentProductCodes,
} from "@/server/payments/config";
import { requestPayAppPayment } from "@/server/payments/payapp";

const bodySchema = z.object({
  productCode: z.enum(paymentProductCodes),
  locale: z.string().refine(isLocale),
  readingInput: PaidReadingInputSchema,
  depositorName: z.string().trim().min(2).max(80).optional(),
  customerPhone: z.string().trim().regex(/^01[016789]-?\d{3,4}-?\d{4}$/).optional(),
}).strict();

export async function POST(request: Request) {
  const auth = await requireSupabaseUser();
  if (auth.error === "SUPABASE_DISABLED") {
    return NextResponse.json(
      { error: auth.error },
      { status: 503 },
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
  const { data: adminSettings } = await admin
    .from("admin_settings")
    .select("sales_enabled")
    .eq("id", 1)
    .maybeSingle();
  if (adminSettings && !adminSettings.sales_enabled) {
    return NextResponse.json({ error: "SALES_PAUSED" }, { status: 503 });
  }

  const product = readiness.config.products[parsed.data.productCode];
  if (
    parsed.data.readingInput.productCode !== parsed.data.productCode ||
    parsed.data.readingInput.locale !== parsed.data.locale
  ) {
    return NextResponse.json({ error: "READING_INPUT_MISMATCH" }, { status: 400 });
  }
  const orderId = `ia${randomUUID().replaceAll("-", "")}`;
  if (readiness.config.provider === "manual_transfer" && !parsed.data.depositorName) {
    return NextResponse.json({ error: "DEPOSITOR_NAME_REQUIRED" }, { status: 400 });
  }
  if (readiness.config.provider === "payapp" && !parsed.data.customerPhone) {
    return NextResponse.json({ error: "CUSTOMER_PHONE_REQUIRED" }, { status: 400 });
  }
  const depositDeadline = readiness.config.provider === "manual_transfer"
    ? new Date(Date.now() + readiness.config.depositWindowHours * 60 * 60 * 1_000)
    : null;
  const guestAccessToken = auth.user ? null : randomBytes(32).toString("base64url");
  const guestAccessTokenHash = guestAccessToken
    ? createHash("sha256").update(guestAccessToken).digest("hex")
    : null;
  const { error } = await admin.from("payment_orders").insert({
    order_id: orderId,
    owner_user_id: auth.user?.id ?? null,
    guest_access_token_hash: guestAccessTokenHash,
    product_code: product.code,
    provider: readiness.config.provider,
    amount: product.amount,
    currency: "KRW",
    status: readiness.config.provider === "manual_transfer"
      ? "WAITING_FOR_DEPOSIT"
      : "CREATED",
    manual_depositor_name: readiness.config.provider === "manual_transfer"
      ? parsed.data.depositorName
      : null,
    deposit_deadline: depositDeadline?.toISOString() ?? null,
  });
  if (error) {
    return NextResponse.json({ error: "ORDER_CREATE_FAILED" }, { status: 500 });
  }
  const { error: reportError } = await admin.from("purchased_reports").insert({
    order_id: orderId,
    owner_user_id: auth.user?.id ?? null,
    guest_access_token_hash: guestAccessTokenHash,
    product_code: product.code,
    locale: parsed.data.locale,
    input: parsed.data.readingInput,
    status: "pending_payment",
  });
  if (reportError) {
    await admin.from("payment_orders").delete().eq("order_id", orderId);
    return NextResponse.json({ error: "REPORT_DRAFT_CREATE_FAILED" }, { status: 500 });
  }

  const baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const locale = parsed.data.locale;
  const successUrl = new URL(`/${locale}/payments/success`, baseUrl).toString();
  const failUrl = new URL(`/${locale}/payments/fail`, baseUrl).toString();
  const success = new URL(successUrl);
  if (guestAccessToken) success.searchParams.set("access", guestAccessToken);
  const reportUrl = new URL(`/${locale}/reports/${orderId}`, baseUrl);
  if (guestAccessToken) reportUrl.searchParams.set("access", guestAccessToken);
  if (readiness.config.provider === "manual_transfer") {
    return NextResponse.json({
      provider: "manual_transfer",
      orderId,
      orderName: product.names[locale],
      amount: product.amount,
      currency: "KRW",
      bankAccounts: readiness.config.bankAccounts,
      depositorName: parsed.data.depositorName,
      depositDeadline: depositDeadline?.toISOString(),
      reportUrl: reportUrl.toString(),
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  }
  if (readiness.config.provider === "payapp") {
    const returnUrl = new URL("/api/payments/payapp/return", baseUrl);
    returnUrl.searchParams.set("locale", locale);
    returnUrl.searchParams.set("orderId", orderId);

    try {
      const payApp = await requestPayAppPayment({
        userId: readiness.config.userId,
        orderId,
        productCode: product.code,
        orderName: product.names[locale],
        amount: product.amount,
        customerPhone: parsed.data.customerPhone!.replaceAll("-", ""),
        customerEmail: auth.user?.email ?? undefined,
        openPayTypes: readiness.config.openPayTypes,
        feedbackUrl: new URL("/api/payments/payapp/feedback", baseUrl).toString(),
        returnUrl: returnUrl.toString(),
      });
      const { error: requestUpdateError } = await admin
        .from("payment_orders")
        .update({
          status: "READY",
          provider_snapshot: {
            requestNumber: payApp.requestNumber,
            requestedAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId)
        .eq("provider", "payapp");
      if (requestUpdateError) throw requestUpdateError;

      return NextResponse.json({
        provider: "payapp",
        orderId,
        orderName: product.names[locale],
        amount: product.amount,
        currency: "KRW",
        payUrl: payApp.payUrl,
        reportUrl: reportUrl.toString(),
      }, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch {
      await admin.from("purchased_reports").delete().eq("order_id", orderId);
      await admin.from("payment_orders").delete().eq("order_id", orderId);
      return NextResponse.json({ error: "PAYAPP_REQUEST_FAILED" }, { status: 502 });
    }
  }
  if (readiness.config.provider === "portone") {
    return NextResponse.json({
      provider: "portone",
      paymentId: orderId,
      orderName: product.names[locale],
      amount: product.amount,
      currency: "KRW",
      storeId: readiness.config.storeId,
      channelKey: readiness.config.channelKey,
      customerId: auth.user?.id ?? `guest_${guestAccessTokenHash?.slice(0, 24)}`,
      customerEmail: auth.user?.email ?? undefined,
      successUrl: success.toString(),
      failUrl,
      noticeUrl: new URL("/api/payments/portone/webhook", baseUrl).toString(),
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.json({
    provider: "toss",
    orderId,
    orderName: product.names[locale],
    amount: product.amount,
    currency: "KRW",
    clientKey: readiness.config.clientKey,
    customerKey: deriveTossCustomerKey(
      auth.user?.id ?? `guest_${guestAccessTokenHash}`,
      readiness.config.customerKeySalt,
    ),
    customerEmail: auth.user?.email ?? undefined,
    successUrl: success.toString(),
    failUrl,
    methodVariantKey: readiness.config.methodVariantKey,
    agreementVariantKey: readiness.config.agreementVariantKey,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
