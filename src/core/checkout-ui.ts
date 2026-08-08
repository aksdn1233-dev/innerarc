import {
  PaidReadingInputSchema,
  type PaidReadingInput,
} from "@/core/paid-reading";
import type { PaymentProductCode } from "@/server/payments/config";

export type CheckoutErrorCode =
  | "missing_draft"
  | "invalid_depositor"
  | "invalid_phone"
  | "missing_consent"
  | "temporarily_unavailable"
  | "rate_limited"
  | "order_failed"
  | "price_changed"
  | "widget_failed"
  | "payment_failed";

export function selectCheckoutReadingInput(
  readingInput: PaidReadingInput,
  productCode: PaymentProductCode,
): PaidReadingInput {
  return PaidReadingInputSchema.parse({
    ...readingInput,
    productCode,
  });
}

export function checkoutErrorFromResponse(status: number, body: unknown): CheckoutErrorCode {
  const code = body && typeof body === "object" && "error" in body
    ? String((body as { error?: unknown }).error ?? "")
    : "";
  if (status === 429) return "rate_limited";
  if (code === "PRIVACY_CONSENT_REQUIRED") return "missing_consent";
  if (status === 409 || code === "PRICE_CHANGED") return "price_changed";
  if (
    status === 503 ||
    code === "PAYMENTS_UNAVAILABLE" ||
    code === "SUPABASE_DISABLED" ||
    code === "SALES_PAUSED"
  ) {
    return "temporarily_unavailable";
  }
  return "order_failed";
}
