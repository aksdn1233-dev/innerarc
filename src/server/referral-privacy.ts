import { createHmac } from "node:crypto";

export function normalizeKoreanMobilePhone(value: string): string | null {
  const digits = value.replaceAll(/[^0-9]/g, "");
  return /^01[016789]\d{7,8}$/.test(digits) ? digits : null;
}

export function hashReferralPhone(phone: string, secret: string): string {
  const normalized = normalizeKoreanMobilePhone(phone);
  if (!normalized) throw new Error("INVALID_REFERRAL_PHONE");
  if (secret.trim().length < 32) throw new Error("INVALID_REFERRAL_HASH_SECRET");
  return createHmac("sha256", secret).update(normalized).digest("hex");
}

export function inspectReferralFeature(
  environment: Readonly<Record<string, string | undefined>> = process.env,
) {
  const requested = environment.REFERRAL_DISCOUNT_ENABLED === "true";
  if (!requested) return { enabled: false, reason: "DISABLED" } as const;
  if ((environment.REFERRAL_PHONE_HASH_SECRET?.trim().length ?? 0) < 32) {
    return { enabled: false, reason: "INCOMPLETE" } as const;
  }
  return { enabled: true, reason: "READY" } as const;
}
