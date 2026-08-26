import { createHmac, timingSafeEqual } from "node:crypto";
import { hashCustomerPhone } from "@/server/order-pass";
import type { PaymentProductCode } from "@/server/payments/config";

export const REFERRAL_COUPON_DISCOUNT_KRW = 5_000;
export const REFERRAL_COUPON_STARTS_AT = "2026-08-25T15:00:00.000Z";
export const REFERRAL_COUPON_EXPIRES_AT = "2026-09-25T15:00:00.000Z";

type EnvironmentLike = Readonly<Record<string, string | undefined>>;

function secret(environment: EnvironmentLike): string | null {
  const key = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return key ? createHmac("sha256", key).update("referral-coupon-2026-08").digest("hex") : null;
}

function signature(payload: string, environment: EnvironmentLike): string | null {
  const key = secret(environment);
  return key ? createHmac("sha256", key).update(payload).digest("base64url").slice(0, 22) : null;
}

export function issueReferralCoupon(phone: string, environment: EnvironmentLike = process.env): string | null {
  const phoneHash = hashCustomerPhone(phone, environment);
  if (!phoneHash) return null;
  const payload = Buffer.from(`${phoneHash}.${REFERRAL_COUPON_EXPIRES_AT}`, "utf8").toString("base64url");
  const signed = signature(payload, environment);
  return signed ? `GY5-${payload}.${signed}` : null;
}

export function validateReferralCoupon(input: Readonly<{
  code: string;
  customerPhone: string;
  productCode: PaymentProductCode;
  now: Date;
}>, environment: EnvironmentLike = process.env): boolean {
  if (input.now < new Date(REFERRAL_COUPON_STARTS_AT) || input.now >= new Date(REFERRAL_COUPON_EXPIRES_AT)) return false;
  if (input.productCode !== "pro_30d" && input.productCode !== "premium_pdf") return false;
  const match = /^GY5-([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]{22})$/.exec(input.code.trim());
  if (!match) return false;
  const expected = signature(match[1], environment);
  if (!expected) return false;
  const actualBytes = Buffer.from(match[2]);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return false;
  let decoded: string;
  try { decoded = Buffer.from(match[1], "base64url").toString("utf8"); } catch { return false; }
  const splitAt = decoded.indexOf(".");
  if (splitAt < 0) return false;
  const phoneHash = hashCustomerPhone(input.customerPhone, environment);
  return Boolean(phoneHash) && decoded.slice(0, splitAt) === phoneHash && decoded.slice(splitAt + 1) === REFERRAL_COUPON_EXPIRES_AT;
}
