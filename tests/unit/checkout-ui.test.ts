import { describe, expect, it } from "vitest";
import {
  checkoutErrorFromResponse,
  selectCheckoutReadingInput,
} from "@/core/checkout-ui";
import type { PaidReadingInput } from "@/core/paid-reading";

const readingInput: PaidReadingInput = {
  version: 1,
  locale: "ko",
  productCode: "plus_30d",
  birthDate: "1994-11-04",
  name: "테스트",
  focusId: "relationships",
  concern: "지금 이 관계에서 먼저 확인할 행동은 무엇인가요?",
  createdAt: "2026-07-30T10:00:00.000Z",
};

describe("checkout UI boundary", () => {
  it("switches the selected product and report input together without mutating the draft", () => {
    const selected = selectCheckoutReadingInput(readingInput, "premium_pdf");

    expect(selected.productCode).toBe("premium_pdf");
    expect(selected).toMatchObject({
      birthDate: readingInput.birthDate,
      concern: readingInput.concern,
      locale: readingInput.locale,
    });
    expect(readingInput.productCode).toBe("plus_30d");
  });

  it.each([
    [429, { error: "RATE_LIMITED" }, "rate_limited"],
    [409, { error: "PRICE_CHANGED" }, "price_changed"],
    [503, { error: "SALES_PAUSED" }, "temporarily_unavailable"],
    [400, { error: "PAYMENTS_UNAVAILABLE" }, "temporarily_unavailable"],
    [400, { error: "SUPABASE_DISABLED" }, "temporarily_unavailable"],
    [400, { error: "PRIVACY_CONSENT_REQUIRED" }, "missing_consent"],
    [502, { error: "PAYAPP_REQUEST_FAILED" }, "order_failed"],
    [500, null, "order_failed"],
  ] as const)("maps status %s to a bounded buyer-facing error", (status, body, expected) => {
    expect(checkoutErrorFromResponse(status, body)).toBe(expected);
  });
});
