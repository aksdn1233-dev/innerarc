import { createHash, randomBytes, randomUUID } from "node:crypto";
import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { resolvePublicAppUrl } from "@/core/site-url";
import { isCampaignDiscountedProduct, resolveProductPricing } from "@/core/product-prices";
import { isLocale } from "@/i18n/config";
import { PaidReadingInputSchema } from "@/core/paid-reading";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import {
  deriveTossCustomerKey,
  inspectPaymentReadiness,
  purchasablePaymentProductCodes,
} from "@/server/payments/config";
import { PayAppApiError, requestPayAppPayment } from "@/server/payments/payapp";
import {
  readOperationsGate,
  recordPaymentSetupEvent,
} from "@/server/payments/gate";
import { hashCustomerPhone, issueOrderTicket } from "@/server/order-pass";
import { checkCheckoutLimit, tooManyRequests } from "@/server/request-limit";
import { REFERRAL_COUPON_DISCOUNT_KRW, validateReferralCoupon } from "@/server/referral-coupon";

const bodySchema = z.object({
  productCode: z.enum(purchasablePaymentProductCodes),
  expectedAmount: z.number().int().min(100).max(10_000_000),
  locale: z.string().refine(isLocale),
  returnLocale: z.literal("ja").optional(),
  readingInput: PaidReadingInputSchema,
  depositorName: z.string().trim().min(2).max(80).optional(),
  customerPhone: z.string().trim().regex(/^01[016789]-?\d{3,4}-?\d{4}$/).optional(),
  couponCode: z.string().trim().min(20).max(300).optional(),
}).strict();

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
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

  const admin = resolveSupabaseAdminClient().client;
  if (!admin) {
    return NextResponse.json({ error: "PAYMENTS_UNAVAILABLE" }, { status: 503 });
  }
  // The incident pause switch can be changed without a rebuild. Payment readiness is
  // otherwise determined directly by provider, credentials, database, and catalog.
  const now = new Date();
  const pricing = resolveProductPricing(now);
  const gate = await readOperationsGate(admin);
  const readiness = inspectPaymentReadiness(process.env, undefined, now);
  if (!readiness.enabled) {
    return NextResponse.json({ error: "PAYMENTS_UNAVAILABLE" }, { status: 503 });
  }
  if (!gate.salesEnabled) {
    return NextResponse.json({ error: "SALES_PAUSED" }, { status: 503 });
  }

  const product = readiness.config.products[parsed.data.productCode];
  if (isCampaignDiscountedProduct(pricing, parsed.data.productCode) && parsed.data.couponCode) {
    return NextResponse.json({ error: "INVALID_COUPON" }, { status: 400 });
  }
  const couponApplied = Boolean(parsed.data.couponCode) && Boolean(parsed.data.customerPhone) &&
    validateReferralCoupon({ code: parsed.data.couponCode!, customerPhone: parsed.data.customerPhone!, productCode: product.code, now });
  if (parsed.data.couponCode && !couponApplied) {
    return NextResponse.json({ error: "INVALID_COUPON" }, { status: 400 });
  }
  const chargeAmount = product.amount - (couponApplied ? REFERRAL_COUPON_DISCOUNT_KRW : 0);
  if (parsed.data.expectedAmount !== chargeAmount) {
    return NextResponse.json({ error: "PRICE_CHANGED" }, { status: 409 });
  }
  if (
    parsed.data.readingInput.productCode !== parsed.data.productCode ||
    parsed.data.readingInput.locale !== parsed.data.locale
  ) {
    return NextResponse.json({ error: "READING_INPUT_MISMATCH" }, { status: 400 });
  }
  if (
    parsed.data.productCode === "plus_30d" &&
    parsed.data.readingInput.readingKind !== "saju_chart"
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
  // Each accepted request creates a real payment request at the provider.
  const phoneHash = parsed.data.customerPhone
    ? hashCustomerPhone(parsed.data.customerPhone)
    : null;
  const limit = await checkCheckoutLimit(admin, phoneHash, now);
  if (!limit.allowed) return tooManyRequests(limit);
  if (couponApplied && phoneHash) {
    const { data: previous } = await admin.from("payment_orders")
      .select("status")
      .eq("customer_phone_hash", phoneHash)
      .in("amount", [34_000, 74_000])
      .limit(10);
    if ((previous ?? []).some((row) => !["CANCELED", "ABORTED", "EXPIRED"].includes(String(row.status)))) {
      return NextResponse.json({ error: "COUPON_ALREADY_USED" }, { status: 409 });
    }
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
    amount: chargeAmount,
    currency: "KRW",
    status: readiness.config.provider === "manual_transfer"
      ? "WAITING_FOR_DEPOSIT"
      : "CREATED",
    manual_depositor_name: readiness.config.provider === "manual_transfer"
      ? parsed.data.depositorName
      : null,
    deposit_deadline: depositDeadline?.toISOString() ?? null,
    // Lets the buyer find this order again later without an account.
    customer_phone_hash: phoneHash,
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

  // Keep checkout working even if NEXT_PUBLIC_APP_URL is missing or malformed.
  // The request origin is a safe fallback for callback URLs.
  let baseUrl: URL;
  try {
    baseUrl = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  } catch {
    baseUrl = new URL(`${new URL(request.url).origin}/`);
    await recordPaymentSetupEvent(admin, {
      provider: readiness.config.provider,
      stage: "provider_request",
      code: "APP_URL_FALLBACK",
      message: "NEXT_PUBLIC_APP_URL is invalid; using request origin for callback URLs.",
      orderId,
    });
  }
  const locale = parsed.data.locale;
  const returnLocale = parsed.data.returnLocale ?? locale;
  const successUrl = new URL(`/${locale}/payments/success`, baseUrl).toString();
  const failUrl = new URL(`/${locale}/payments/fail`, baseUrl).toString();
  const success = new URL(successUrl);
  if (guestAccessToken) success.searchParams.set("access", guestAccessToken);
  if (returnLocale === "ja") success.searchParams.set("displayLocale", "ja");
  const reportUrl = new URL(`/${returnLocale}/reports/${orderId}`, baseUrl);
  if (guestAccessToken) reportUrl.searchParams.set("access", guestAccessToken);
  if (readiness.config.provider === "manual_transfer") {
    return NextResponse.json({
      provider: "manual_transfer",
      orderId,
      orderName: product.names[locale],
      amount: chargeAmount,
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
    returnUrl.searchParams.set("locale", returnLocale);
    returnUrl.searchParams.set("orderId", orderId);
    // Carried through the provider so the buyer lands on their report on return,
    // whatever browsing context the payment app sends them back in.
    const ticket = issueOrderTicket(orderId, new Date());
    if (ticket) returnUrl.searchParams.set("rt", ticket);

    try {
      const payApp = await requestPayAppPayment({
        userId: readiness.config.userId,
        orderId,
        productCode: product.code,
        orderName: product.names[locale],
        amount: chargeAmount,
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
        amount: chargeAmount,
        currency: "KRW",
        payUrl: payApp.payUrl,
        reportUrl: reportUrl.toString(),
      }, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (cause) {
      await admin.from("purchased_reports").delete().eq("order_id", orderId);
      await admin.from("payment_orders").delete().eq("order_id", orderId);
      // The provider's own rejection wording is the only thing that distinguishes a
      // merchant-side cause from a bug, so it is kept where the operator can read it.
      await recordPaymentSetupEvent(admin, {
        provider: "payapp",
        stage: "provider_request",
        code: cause instanceof PayAppApiError ? cause.code : "UNEXPECTED_ERROR",
        message: cause instanceof PayAppApiError
          ? cause.providerMessage
          : "An unexpected error occurred while requesting PayApp payment.",
        orderId,
      });
      return NextResponse.json({ error: "PAYAPP_REQUEST_FAILED" }, { status: 502 });
    }
  }
  if (readiness.config.provider === "portone") {
    return NextResponse.json({
      provider: "portone",
      paymentId: orderId,
      orderName: product.names[locale],
      amount: chargeAmount,
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
    amount: chargeAmount,
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
