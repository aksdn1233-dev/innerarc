import { describe, expect, it } from "vitest";
import { calculateReferralDiscount } from "@/core/referral-policy";
import {
  hashReferralPhone,
  inspectReferralFeature,
  normalizeKoreanMobilePhone,
} from "@/server/referral-privacy";

describe("inactive referral foundation", () => {
  it("calculates 25% per verified friend with the draft 50% cap", () => {
    expect(calculateReferralDiscount(39_000, 1)).toMatchObject({
      discountBasisPoints: 2_500,
      discountAmount: 9_750,
      finalAmount: 29_250,
    });
    expect(calculateReferralDiscount(39_000, 9)).toMatchObject({
      appliedFriends: 2,
      discountBasisPoints: 5_000,
      finalAmount: 19_500,
    });
  });

  it("normalizes Korean phones and stores only a keyed, stable hash", () => {
    expect(normalizeKoreanMobilePhone("010-1234-5678")).toBe("01012345678");
    expect(normalizeKoreanMobilePhone("02-123-4567")).toBeNull();
    const secret = "r".repeat(32);
    const hash = hashReferralPhone("010-1234-5678", secret);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(hashReferralPhone("01012345678", secret));
    expect(hash).not.toContain("01012345678");
  });

  it("stays disabled unless both the explicit flag and a separate secret exist", () => {
    expect(inspectReferralFeature({})).toEqual({ enabled: false, reason: "DISABLED" });
    expect(inspectReferralFeature({ REFERRAL_DISCOUNT_ENABLED: "true" }))
      .toEqual({ enabled: false, reason: "INCOMPLETE" });
    expect(inspectReferralFeature({
      REFERRAL_DISCOUNT_ENABLED: "true",
      REFERRAL_PHONE_HASH_SECRET: "s".repeat(32),
    })).toEqual({ enabled: true, reason: "READY" });
  });
});
