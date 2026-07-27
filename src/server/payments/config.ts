import { createHmac } from "node:crypto";
import { z } from "zod";

export const paymentProductCodes = ["plus_30d", "pro_30d", "premium_pdf"] as const;
export type PaymentProductCode = (typeof paymentProductCodes)[number];
export type PaymentRuntimeMode = "development" | "test" | "production";

const priceSchema = z.coerce.number().int().min(100).max(10_000_000);
const variantKeySchema = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);

export type PaymentProduct = Readonly<{
  code: PaymentProductCode;
  tier: "plus" | "pro";
  durationDays: 30;
  amount: number;
  names: Readonly<{ ko: string; en: string }>;
}>;

export type TossPaymentConfig = Readonly<{
  provider: "toss";
  clientKey: string;
  secretKey: string;
  customerKeySalt: string;
  methodVariantKey: string;
  agreementVariantKey: string;
  products: Readonly<Record<PaymentProductCode, PaymentProduct>>;
}>;

export type PortOnePaymentConfig = Readonly<{
  provider: "portone";
  storeId: string;
  channelKey: string;
  apiSecret: string;
  webhookSecret: string;
  products: Readonly<Record<PaymentProductCode, PaymentProduct>>;
}>;

export type ManualTransferPaymentConfig = Readonly<{
  provider: "manual_transfer";
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  depositWindowHours: number;
  products: Readonly<Record<PaymentProductCode, PaymentProduct>>;
}>;

export type PaymentConfig =
  | TossPaymentConfig
  | PortOnePaymentConfig
  | ManualTransferPaymentConfig;

export type PaymentReadiness =
  | Readonly<{ enabled: false; reason: "DISABLED" | "INCOMPLETE" | "INVALID" }>
  | Readonly<{ enabled: true; config: PaymentConfig }>;

const storeIdSchema = z.string().regex(/^store-[0-9a-f-]{36}$/i);
const channelKeySchema = z.string().regex(/^channel-key-[0-9a-f-]{36}$/i);
const apiSecretSchema = z.string().min(20).max(500);
const webhookSecretSchema = z.string().min(20).max(500);
const bankNameSchema = z.string().min(2).max(80);
const bankAccountSchema = z.string().regex(/^[0-9-]{6,40}$/);
const accountHolderSchema = z.string().min(2).max(80);
const depositWindowSchema = z.coerce.number().int().min(1).max(168);

function buildProducts(quickPrice: number, comprehensivePrice: number, premiumPdfPrice: number) {
  return {
    plus_30d: {
      code: "plus_30d",
      tier: "plus",
      durationDays: 30,
      amount: quickPrice,
      names: { ko: "간단 타로 리딩", en: "Quick tarot reading" },
    },
    pro_30d: {
      code: "pro_30d",
      tier: "pro",
      durationDays: 30,
      amount: comprehensivePrice,
      names: { ko: "타로·생년월일 종합 리딩", en: "Tarot and birth-date reading" },
    },
    premium_pdf: {
      code: "premium_pdf",
      tier: "pro",
      durationDays: 30,
      amount: premiumPdfPrice,
      names: { ko: "프리미엄 맞춤 PDF", en: "Premium custom PDF" },
    },
  } as const satisfies Readonly<Record<PaymentProductCode, PaymentProduct>>;
}

function isClientKey(value: string, runtimeMode: PaymentRuntimeMode): boolean {
  const isTest = value.startsWith("test_ck_");
  const isLive = value.startsWith("live_ck_");
  return value.length >= 20 && (runtimeMode === "production" ? isLive : isTest || isLive);
}

function isSecretKey(value: string, runtimeMode: PaymentRuntimeMode): boolean {
  const isTest = value.startsWith("test_sk_");
  const isLive = value.startsWith("live_sk_");
  return value.length >= 20 && (runtimeMode === "production" ? isLive : isTest || isLive);
}

export function inspectPaymentReadiness(
  environment: Readonly<Record<string, string | undefined>> = process.env,
  runtimeMode: PaymentRuntimeMode = environment.NODE_ENV === "production"
    ? "production"
    : environment.NODE_ENV === "test"
      ? "test"
      : "development",
): PaymentReadiness {
  const provider = environment.PAYMENTS_PROVIDER?.trim() || "disabled";
  if (provider === "disabled") return { enabled: false, reason: "DISABLED" };
  if (
    provider !== "toss" &&
    provider !== "portone" &&
    provider !== "manual_transfer"
  ) {
    return { enabled: false, reason: "INVALID" };
  }

  const quickPrice = (
    environment.INNERARC_QUICK_TAROT_PRICE_KRW ??
    environment.INNERARC_PLUS_30D_PRICE_KRW
  )?.trim();
  const comprehensivePrice = (
    environment.INNERARC_COMPREHENSIVE_PRICE_KRW ??
    environment.INNERARC_PRO_30D_PRICE_KRW
  )?.trim();
  const premiumPdfPrice = environment.INNERARC_PREMIUM_PDF_PRICE_KRW?.trim();
  if (!quickPrice || !comprehensivePrice || !premiumPdfPrice) {
    return { enabled: false, reason: "INCOMPLETE" };
  }

  const prices = z.object({
    quickPrice: priceSchema,
    comprehensivePrice: priceSchema,
    premiumPdfPrice: priceSchema,
  }).safeParse({ quickPrice, comprehensivePrice, premiumPdfPrice });
  if (!prices.success) return { enabled: false, reason: "INVALID" };

  if (provider === "manual_transfer") {
    const parsed = z.object({
      bankName: bankNameSchema,
      accountNumber: bankAccountSchema,
      accountHolder: accountHolderSchema,
      depositWindowHours: depositWindowSchema,
    }).safeParse({
      bankName: environment.MANUAL_BANK_NAME?.trim(),
      accountNumber: environment.MANUAL_BANK_ACCOUNT?.trim(),
      accountHolder: environment.MANUAL_BANK_HOLDER?.trim(),
      depositWindowHours: environment.MANUAL_DEPOSIT_WINDOW_HOURS?.trim() || "24",
    });
    if (!parsed.success) {
      const missing = [
        environment.MANUAL_BANK_NAME,
        environment.MANUAL_BANK_ACCOUNT,
        environment.MANUAL_BANK_HOLDER,
      ].some((value) => !value?.trim());
      return { enabled: false, reason: missing ? "INCOMPLETE" : "INVALID" };
    }
    return {
      enabled: true,
      config: {
        provider: "manual_transfer",
        ...parsed.data,
        products: buildProducts(
          prices.data.quickPrice,
          prices.data.comprehensivePrice,
          prices.data.premiumPdfPrice,
        ),
      },
    };
  }

  if (provider === "portone") {
    const parsed = z.object({
      storeId: storeIdSchema,
      channelKey: channelKeySchema,
      apiSecret: apiSecretSchema,
      webhookSecret: webhookSecretSchema,
    }).safeParse({
      storeId: environment.PORTONE_STORE_ID?.trim(),
      channelKey: environment.PORTONE_KPN_CHANNEL_KEY?.trim(),
      apiSecret: environment.PORTONE_API_SECRET?.trim(),
      webhookSecret: environment.PORTONE_WEBHOOK_SECRET?.trim(),
    });
    if (!parsed.success) {
      const missing = [
        environment.PORTONE_STORE_ID,
        environment.PORTONE_KPN_CHANNEL_KEY,
        environment.PORTONE_API_SECRET,
        environment.PORTONE_WEBHOOK_SECRET,
      ].some((value) => !value?.trim());
      return { enabled: false, reason: missing ? "INCOMPLETE" : "INVALID" };
    }
    return {
      enabled: true,
      config: {
        provider: "portone",
        ...parsed.data,
        products: buildProducts(
          prices.data.quickPrice,
          prices.data.comprehensivePrice,
          prices.data.premiumPdfPrice,
        ),
      },
    };
  }

  const clientKey = environment.TOSS_CLIENT_KEY?.trim();
  const secretKey = environment.TOSS_SECRET_KEY?.trim();
  const customerKeySalt = environment.TOSS_CUSTOMER_KEY_SALT?.trim();
  const methodVariantKey = environment.TOSS_PAYMENT_METHOD_VARIANT_KEY?.trim() || "DEFAULT";
  const agreementVariantKey = environment.TOSS_AGREEMENT_VARIANT_KEY?.trim() || "AGREEMENT";

  if (!clientKey || !secretKey || !customerKeySalt) {
    return { enabled: false, reason: "INCOMPLETE" };
  }

  const parsed = z.object({
    methodVariantKey: variantKeySchema,
    agreementVariantKey: variantKeySchema,
  }).safeParse({ methodVariantKey, agreementVariantKey });

  if (
    !parsed.success ||
    customerKeySalt.length < 32 ||
    !isClientKey(clientKey, runtimeMode) ||
    !isSecretKey(secretKey, runtimeMode)
  ) {
    return { enabled: false, reason: "INVALID" };
  }

  return {
    enabled: true,
    config: {
      provider: "toss",
      clientKey,
      secretKey,
      customerKeySalt,
      methodVariantKey: parsed.data.methodVariantKey,
      agreementVariantKey: parsed.data.agreementVariantKey,
      products: buildProducts(
        prices.data.quickPrice,
        prices.data.comprehensivePrice,
        prices.data.premiumPdfPrice,
      ),
    },
  };
}

export function deriveTossCustomerKey(userId: string, salt: string): string {
  return `innerarc_${createHmac("sha256", salt).update(userId).digest("hex").slice(0, 40)}`;
}
