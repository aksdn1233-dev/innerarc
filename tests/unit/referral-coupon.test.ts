import { describe, expect, it } from "vitest";
import { issueReferralCoupon, validateReferralCoupon } from "@/server/referral-coupon";

const environment = { SUPABASE_SERVICE_ROLE_KEY: "s".repeat(64) };

describe("referral coupon", () => {
  it("binds a deterministic coupon to the checkout phone without embedding raw digits", () => {
    const code = issueReferralCoupon("010-1234-5678", environment);
    expect(code).toBeTruthy();
    expect(code).not.toContain("01012345678");
    expect(issueReferralCoupon("01012345678", environment)).toBe(code);
  });

  it("opens in its own validity window only for eligible products and the issuing phone", () => {
    const code = issueReferralCoupon("010-1234-5678", environment)!;
    const base = { code, customerPhone: "01012345678", productCode: "pro_30d" as const };
    expect(validateReferralCoupon({ ...base, now: new Date("2026-08-25T15:00:00.000Z") }, environment)).toBe(true);
    expect(validateReferralCoupon({ ...base, now: new Date("2026-08-24T15:00:00.000Z") }, environment)).toBe(false);
    expect(validateReferralCoupon({ ...base, customerPhone: "01099998888", now: new Date("2026-08-26T00:00:00.000Z") }, environment)).toBe(false);
    expect(validateReferralCoupon({ ...base, productCode: "plus_30d", now: new Date("2026-08-26T00:00:00.000Z") }, environment)).toBe(false);
  });
});
