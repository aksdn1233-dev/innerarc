/**
 * A review says something about the product to a stranger, so every label on it has to
 * be true. The type is decided from the order the server verified, never from the form.
 */
export const REVIEW_TYPES = [
  "verified_purchaser",
  "beta_participant",
  "free_reading",
] as const;
export type ReviewType = (typeof REVIEW_TYPES)[number];

export const REVIEW_STATUSES = ["pending", "approved", "rejected", "withdrawn"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

/** Whether the reading changed a planned action — the one question worth measuring. */
export const CHANGED_ACTIONS = ["changed", "considering", "unchanged", "too_early"] as const;
export type ChangedAction = (typeof CHANGED_ACTIONS)[number];

export const REVIEW_PRODUCT_CODES = ["plus_30d", "pro_30d", "premium_pdf"] as const;
export type ReviewProductCode = (typeof REVIEW_PRODUCT_CODES)[number];

/** What a reviewer types. Nothing else about them is collected by this form. */
export type ReviewAnswers = Readonly<{
  wantedToUnderstand: string;
  mostUseful: string;
  hardToUnderstand: string;
  changedAction: ChangedAction;
}>;

export type ReviewSubmission = ReviewAnswers & Readonly<{
  publicConsent: boolean;
  displayName: string;
  hideProductContext: boolean;
  campaignEntryConsent: boolean;
}>;

/** The stored shape. Mirrors the columns of public.product_reviews. */
export type StoredReviewRow = Readonly<{
  id: string;
  order_id: string | null;
  review_type: ReviewType;
  product_code: ReviewProductCode | null;
  locale: "ko" | "en";
  wanted_to_understand: string;
  most_useful: string;
  hard_to_understand: string;
  changed_action: ChangedAction;
  public_consent: boolean;
  display_name: string;
  hide_product_context: boolean;
  status: ReviewStatus;
  admin_note: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  consent_withdrawn_at: string | null;
}>;

/**
 * What a visitor is allowed to see. Deliberately a different type from the stored row:
 * the order number, the exact submission time, the administrator note, and the consent
 * bookkeeping have no field here, so they cannot reach a public page by accident.
 */
export type PublicReview = Readonly<{
  id: string;
  reviewType: ReviewType;
  displayName: string;
  productCode: ReviewProductCode | null;
  wantedToUnderstand: string | null;
  mostUseful: string;
  hardToUnderstand: string | null;
  changedAction: ChangedAction;
  /** Month only (YYYY-MM). A to-the-second timestamp narrows a review to one order. */
  publishedMonth: string;
}>;

/** What the reviewer themselves may see about their own submission. */
export type OwnReviewState = Readonly<{
  status: ReviewStatus;
  publicConsent: boolean;
  displayName: string;
  hideProductContext: boolean;
  campaignEntryConsent: boolean;
  submittedAt: string;
}>;
