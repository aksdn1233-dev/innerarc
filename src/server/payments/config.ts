import { createHmac } from "node:crypto";
import { z } from "zod";

export const paymentProductCodes = ["plus_30d", "pro_30d"] as const;
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

export type PaymentReadiness =
  | Readonly<{ enabled: false; reason: "DISABLED" | "INCOMPLETE" | "INVALID" }>
  | Readonly<{ enabled: true; config: TossPaymentConfig }>;

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
  if (provider !== "toss") return { enabled: false, reason: "INVALID" };

  const clientKey = environment.TOSS_CLIENT_KEY?.trim();
  const secretKey = environment.TOSS_SECRET_KEY?.trim();
  const customerKeySalt = environment.TOSS_CUSTOMER_KEY_SALT?.trim();
  const plusPrice = environment.INNERARC_PLUS_30D_PRICE_KRW?.trim();
  const proPrice = environment.INNERARC_PRO_30D_PRICE_KRW?.trim();
  const methodVariantKey = environment.TOSS_PAYMENT_METHOD_VARIANT_KEY?.trim() || "DEFAULT";
  const agreementVariantKey = environment.TOSS_AGREEMENT_VARIANT_KEY?.trim() || "AGREEMENT";

  if (!clientKey || !secretKey || !customerKeySalt || !plusPrice || !proPrice) {
    return { enabled: false, reason: "INCOMPLETE" };
  }

  const parsed = z.object({
    plusPrice: priceSchema,
    proPrice: priceSchema,
    methodVariantKey: variantKeySchema,
    agreementVariantKey: variantKeySchema,
  }).safeParse({ plusPrice, proPrice, methodVariantKey, agreementVariantKey });

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
      products: {
        plus_30d: {
          code: "plus_30d",
          tier: "plus",
          durationDays: 30,
          amount: parsed.data.plusPrice,
          names: { ko: "InnerArc Plus 30일 이용권", en: "InnerArc Plus 30-day access" },
        },
        pro_30d: {
          code: "pro_30d",
          tier: "pro",
          durationDays: 30,
          amount: parsed.data.proPrice,
          names: { ko: "InnerArc Pro 30일 이용권", en: "InnerArc Pro 30-day access" },
        },
      },
    },
  };
}

export function deriveTossCustomerKey(userId: string, salt: string): string {
  return `innerarc_${createHmac("sha256", salt).update(userId).digest("hex").slice(0, 40)}`;
}
