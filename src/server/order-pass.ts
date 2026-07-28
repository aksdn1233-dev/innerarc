import { createHmac, timingSafeEqual } from "node:crypto";
import type { EntitlementTier } from "@/server/paid-access";

// Purchases are one-off and guest-first: there is no account to hang an entitlement
// on. A buyer who opens their own paid report is handed a signed pass naming that
// order and its tier, which is what later gates the larger features. The pass proves
// one completed purchase; it is not a login and carries no personal data.
export const ORDER_PASS_COOKIE = "gyeol_pass";
const PASS_DAYS = 30;
export const orderPassMaxAgeSeconds = PASS_DAYS * 24 * 60 * 60;
const ORDER_ID_PATTERN = /^[A-Za-z0-9_-]{6,64}$/;

// "none" means this browser owns the order but the provider has not confirmed payment
// yet. It unlocks nothing on its own; the report page still shows the waiting screen
// until the callback lands, and every paid feature requires plus or above.
export type PassTier = EntitlementTier | "none";

export type OrderPass = Readonly<{
  orderId: string;
  tier: PassTier;
  expiresAt: number;
}>;

/**
 * Keys the pass signature and the phone lookup hash. Derived from the service-role
 * key so no separate secret has to be provisioned; it never leaves the server and a
 * rotated service-role key simply invalidates outstanding passes.
 */
type EnvironmentLike = Readonly<Record<string, string | undefined>>;

function secretFor(purpose: string, environment: EnvironmentLike = process.env): string | null {
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRoleKey) return null;
  return createHmac("sha256", serviceRoleKey).update(purpose).digest("hex");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function signaturesMatch(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes);
}

export function issueOrderPass(
  input: Readonly<{ orderId: string; tier: PassTier; now: Date }>,
  environment: EnvironmentLike = process.env,
): string | null {
  if (!ORDER_ID_PATTERN.test(input.orderId)) return null;
  const secret = secretFor("order-pass", environment);
  if (!secret) return null;
  const expiresAt = input.now.getTime() + orderPassMaxAgeSeconds * 1_000;
  const payload = `${input.orderId}.${input.tier}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function readOrderPass(
  value: string | undefined,
  now: Date,
  environment: EnvironmentLike = process.env,
): OrderPass | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  const [orderId, tier, expiresAtRaw, signature] = parts;
  if (!ORDER_ID_PATTERN.test(orderId)) return null;
  if (tier !== "plus" && tier !== "pro" && tier !== "none") return null;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now.getTime()) return null;

  const secret = secretFor("order-pass", environment);
  if (!secret) return null;
  const payload = `${orderId}.${tier}.${expiresAt}`;
  if (!signaturesMatch(signature, sign(payload, secret))) return null;
  return { orderId, tier, expiresAt };
}

/** The tier a completed order grants. Mirrors the database entitlement mapping. */
export function tierForProduct(productCode: string): EntitlementTier | null {
  if (productCode === "plus_30d") return "plus";
  if (productCode === "pro_30d" || productCode === "premium_pdf") return "pro";
  return null;
}

const TICKET_DAYS = 7;

/**
 * Handed to the payment provider inside the return URL and echoed back when the buyer
 * returns. It proves this browser is finishing the checkout that created the order, so
 * the report opens immediately even when the provider returns through a different
 * browsing context — an in-app browser after a KakaoPay or Toss hand-off keeps none of
 * the storage the checkout wrote.
 */
export function issueOrderTicket(
  orderId: string,
  now: Date,
  environment: EnvironmentLike = process.env,
): string | null {
  if (!ORDER_ID_PATTERN.test(orderId)) return null;
  const secret = secretFor("order-ticket", environment);
  if (!secret) return null;
  const expiresAt = now.getTime() + TICKET_DAYS * 24 * 60 * 60 * 1_000;
  const payload = `${orderId}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

/** The order this ticket belongs to, or null when it is missing, expired, or edited. */
export function readOrderTicket(
  value: string | undefined,
  now: Date,
  environment: EnvironmentLike = process.env,
): string | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [orderId, expiresAtRaw, signature] = parts;
  if (!ORDER_ID_PATTERN.test(orderId)) return null;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now.getTime()) return null;
  const secret = secretFor("order-ticket", environment);
  if (!secret) return null;
  if (!signaturesMatch(signature, sign(`${orderId}.${expiresAt}`, secret))) return null;
  return orderId;
}

/** Digits only, so "010-1234-5678" and "01012345678" resolve to the same buyer. */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Lookup hash for the buyer's phone number. Peppered so a copy of the orders table
 * cannot be scanned for a known number: a bare hash of an 11-digit number is trivial
 * to reverse.
 */
export function hashCustomerPhone(
  phone: string,
  environment: EnvironmentLike = process.env,
): string | null {
  const digits = normalizePhone(phone);
  if (digits.length < 10 || digits.length > 11) return null;
  const secret = secretFor("phone-lookup", environment);
  if (!secret) return null;
  return createHmac("sha256", secret).update(digits).digest("hex");
}
