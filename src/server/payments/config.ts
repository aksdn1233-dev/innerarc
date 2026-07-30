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
  bankAccounts: readonly Readonly<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }>[];
  depositWindowHours: number;
  products: Readonly<Record<PaymentProductCode, PaymentProduct>>;
}>;

export type PayAppPaymentConfig = Readonly<{
  provider: "payapp";
  userId: string;
  linkKey: string;
  linkValue: string;
  openPayTypes: string;
  products: Readonly<Record<PaymentProductCode, PaymentProduct>>;
}>;

export type PaymentConfig =
  | TossPaymentConfig
  | PortOnePaymentConfig
  | ManualTransferPaymentConfig
  | PayAppPaymentConfig;

export type PaymentReadiness =
  | Readonly<{ enabled: false; reason: "DISABLED" | "UNAPPROVED" | "INCOMPLETE" | "INVALID" }>
  | Readonly<{ enabled: true; config: PaymentConfig }>;

const storeIdSchema = z.string().regex(/^store-[0-9a-f-]{36}$/i);
const channelKeySchema = z.string().regex(/^channel-key-[0-9a-f-]{36}$/i);
const apiSecretSchema = z.string().min(20).max(500);
const webhookSecretSchema = z.string().min(20).max(500);
const bankNameSchema = z.string().min(2).max(80);
const bankAccountSchema = z.string().regex(/^[0-9-]{6,40}$/);
const accountHolderSchema = z.string().min(2).max(80);
const depositWindowSchema = z.coerce.number().int().min(1).max(168);
const payAppUserIdSchema = z.string().regex(/^[A-Za-z0-9_.@-]{3,100}$/);
const payAppSecretSchema = z.string().min(8).max(500);
const payAppMethodSchema = z.enum([
  "card",
  "phone",
  "kakaopay",
  "naverpay",
  "smilepay",
  "rbank",
  "vbank",
  "applepay",
  "payco",
  "myaccount",
  "tosspay",
]);
const bankAccountsSchema = z.array(z.object({
  bankName: bankNameSchema,
  accountNumber: bankAccountSchema,
  accountHolder: accountHolderSchema,
}).strict()).min(1).max(5);

function buildProducts(quickPrice: number, comprehensivePrice: number, premiumPdfPrice: number) {
  return {
    plus_30d: {
      code: "plus_30d",
      tier: "plus",
      durationDays: 30,
      amount: quickPrice,
      names: { ko: "핵심 리딩", en: "Core reading" },
    },
    pro_30d: {
      code: "pro_30d",
      tier: "pro",
      durationDays: 30,
      amount: comprehensivePrice,
      names: { ko: "상세 리딩", en: "Detailed reading" },
    },
    premium_pdf: {
      code: "premium_pdf",
      tier: "pro",
      durationDays: 30,
      amount: premiumPdfPrice,
      names: { ko: "프리미엄 심층 리딩", en: "Premium in-depth reading" },
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
    runtimeMode === "production" &&
    environment.PAYMENTS_LAUNCH_APPROVED?.trim() !== "true"
  ) {
    return { enabled: false, reason: "UNAPPROVED" };
  }
  if (
    provider !== "toss" &&
    provider !== "portone" &&
    provider !== "manual_transfer" &&
    provider !== "payapp"
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

  if (provider === "payapp") {
    const rawMethods = environment.PAYAPP_OPEN_PAY_TYPES?.trim() ||
      "card,kakaopay,tosspay,vbank,phone,rbank";
    const parsedMethods = z.array(payAppMethodSchema).min(1).max(11).safeParse(
      rawMethods.split(",").map((method) => method.trim()).filter(Boolean),
    );
    const parsed = z.object({
      userId: payAppUserIdSchema,
      linkKey: payAppSecretSchema,
      linkValue: payAppSecretSchema,
    }).safeParse({
      userId: environment.PAYAPP_USER_ID?.trim(),
      linkKey: environment.PAYAPP_LINK_KEY?.trim(),
      linkValue: environment.PAYAPP_LINK_VALUE?.trim(),
    });
    if (!parsed.success || !parsedMethods.success) {
      const missing = [
        environment.PAYAPP_USER_ID,
        environment.PAYAPP_LINK_KEY,
        environment.PAYAPP_LINK_VALUE,
      ].some((value) => !value?.trim());
      return { enabled: false, reason: missing ? "INCOMPLETE" : "INVALID" };
    }
    return {
      enabled: true,
      config: {
        provider: "payapp",
        ...parsed.data,
        openPayTypes: parsedMethods.data.join(","),
        products: buildProducts(
          prices.data.quickPrice,
          prices.data.comprehensivePrice,
          prices.data.premiumPdfPrice,
        ),
      },
    };
  }

  if (provider === "manual_transfer") {
    const rawAccounts = environment.MANUAL_BANK_ACCOUNTS_JSON?.trim();
    let bankAccounts: z.infer<typeof bankAccountsSchema> | null = null;
    if (rawAccounts) {
      try {
        const parsedAccounts = bankAccountsSchema.safeParse(JSON.parse(rawAccounts));
        if (!parsedAccounts.success) return { enabled: false, reason: "INVALID" };
        bankAccounts = parsedAccounts.data;
      } catch {
        return { enabled: false, reason: "INVALID" };
      }
    } else {
      const legacyAccount = bankAccountsSchema.safeParse([{
        bankName: environment.MANUAL_BANK_NAME?.trim(),
        accountNumber: environment.MANUAL_BANK_ACCOUNT?.trim(),
        accountHolder: environment.MANUAL_BANK_HOLDER?.trim(),
      }]);
      if (legacyAccount.success) bankAccounts = legacyAccount.data;
    }

    const parsed = z.object({
      depositWindowHours: depositWindowSchema,
    }).safeParse({
      depositWindowHours: environment.MANUAL_DEPOSIT_WINDOW_HOURS?.trim() || "24",
    });
    if (!parsed.success || !bankAccounts) {
      const missing = [
        environment.MANUAL_BANK_ACCOUNTS_JSON,
        environment.MANUAL_BANK_NAME,
        environment.MANUAL_BANK_ACCOUNT,
        environment.MANUAL_BANK_HOLDER,
      ].every((value) => !value?.trim());
      return { enabled: false, reason: missing ? "INCOMPLETE" : "INVALID" };
    }
    return {
      enabled: true,
      config: {
        provider: "manual_transfer",
        bankAccounts,
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
