export const REFERRAL_POLICY_DRAFT = {
  version: "2026-08-01-draft",
  rewardBasisPointsPerVerifiedFriend: 2_500,
  maximumRewardBasisPoints: 5_000,
  maximumRewardedFriends: 2,
  combinableWithCampaigns: false,
} as const;

export type ReferralDiscount = Readonly<{
  verifiedFriends: number;
  appliedFriends: number;
  discountBasisPoints: number;
  discountAmount: number;
  finalAmount: number;
}>;

/**
 * Draft-only referral math. Nothing calls this from checkout until the feature is
 * explicitly enabled and its database migration has been reviewed and applied.
 */
export function calculateReferralDiscount(
  amount: number,
  verifiedFriends: number,
): ReferralDiscount {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("INVALID_AMOUNT");
  if (!Number.isSafeInteger(verifiedFriends) || verifiedFriends < 0) {
    throw new Error("INVALID_VERIFIED_FRIEND_COUNT");
  }
  const appliedFriends = Math.min(
    verifiedFriends,
    REFERRAL_POLICY_DRAFT.maximumRewardedFriends,
  );
  const discountBasisPoints = Math.min(
    appliedFriends * REFERRAL_POLICY_DRAFT.rewardBasisPointsPerVerifiedFriend,
    REFERRAL_POLICY_DRAFT.maximumRewardBasisPoints,
  );
  const discountAmount = Math.floor(amount * discountBasisPoints / 10_000);
  return {
    verifiedFriends,
    appliedFriends,
    discountBasisPoints,
    discountAmount,
    finalAmount: amount - discountAmount,
  };
}
