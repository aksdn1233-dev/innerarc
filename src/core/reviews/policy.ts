import { z } from "zod";
import {
  CHANGED_ACTIONS,
  REVIEW_PRODUCT_CODES,
  type ChangedAction,
  type OwnReviewState,
  type PublicReview,
  type ReviewProductCode,
  type ReviewType,
  type StoredReviewRow,
} from "./types";

export const REVIEW_TEXT_MAX = 600;
export const REVIEW_TEXT_MIN = 5;
export const DISPLAY_NAME_MAX = 16;

/**
 * A display name is chosen to stay anonymous, so it is held to a narrow shape: letters,
 * digits, spaces, and three joiners. That rejects an email address, a URL, and a phone
 * number by construction rather than by pattern-matching for them one at a time.
 */
const DISPLAY_NAME_PATTERN = /^[\p{L}\p{N} ._-]{1,16}$/u;

/** Four or more digits in a row is an order number, a birth year, or part of a phone. */
const DIGIT_RUN = /\d{4,}/u;

export function isAllowedDisplayName(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return true; // Blank is valid and displays as anonymous.
  return DISPLAY_NAME_PATTERN.test(trimmed) && !DIGIT_RUN.test(trimmed);
}

export function normalizeDisplayName(value: string): string {
  const collapsed = value.trim().replace(/\s+/g, " ");
  return isAllowedDisplayName(collapsed) ? collapsed.slice(0, DISPLAY_NAME_MAX) : "";
}

const reviewText = z.string().trim().min(REVIEW_TEXT_MIN).max(REVIEW_TEXT_MAX);

/**
 * The submitted form. `reviewType` is absent on purpose: a visitor cannot ask to be
 * labelled a verified purchaser, the server derives that from the order it checked.
 */
export const ReviewSubmissionSchema = z.object({
  wantedToUnderstand: reviewText,
  mostUseful: reviewText,
  hardToUnderstand: z.string().trim().max(REVIEW_TEXT_MAX).default(""),
  changedAction: z.enum(CHANGED_ACTIONS),
  // Publishing is a second, separate decision. Absent means "no".
  publicConsent: z.boolean().default(false),
  displayName: z.string().trim().max(DISPLAY_NAME_MAX).refine(isAllowedDisplayName, {
    message: "DISPLAY_NAME_NOT_ALLOWED",
  }).default(""),
  hideProductContext: z.boolean().default(false),
}).strict();

export type ParsedReviewSubmission = z.infer<typeof ReviewSubmissionSchema>;

/**
 * The truthful label for a completed reading, decided only from the order record.
 *
 * A paid, confirmed order is a verified purchase. A zero-amount order is a reading the
 * participant did not pay for and is labelled as such. Anything else — an order still
 * waiting on the provider, a cancelled one — is not a reading anybody finished paying
 * for, so it earns no purchase label at all.
 */
export function resolveReviewType(
  order: Readonly<{ status: string; amount: number }> | null,
): ReviewType | null {
  if (!order) return null;
  if (order.status !== "DONE") return null;
  return order.amount > 0 ? "verified_purchaser" : "free_reading";
}

export function isReviewProductCode(value: unknown): value is ReviewProductCode {
  return typeof value === "string" &&
    (REVIEW_PRODUCT_CODES as readonly string[]).includes(value);
}

/** YYYY-MM. Publishing the exact second would tie a review back to a single order. */
export function publishedMonth(isoTimestamp: string): string {
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * The only way a stored review becomes visible to a stranger.
 *
 * Returns null unless the review was approved by a person *and* still carries consent,
 * so revoking either one removes it from every public surface on the next render. The
 * projection drops the order number, the administrator note, and the timestamps; when
 * the reviewer asked to hide their context it also drops the product and the question
 * they came in with, which is the part that describes their situation.
 */
export function toPublicReview(row: StoredReviewRow): PublicReview | null {
  if (row.status !== "approved" || !row.public_consent) return null;
  const hidden = row.hide_product_context;
  return {
    id: row.id,
    reviewType: row.review_type,
    displayName: normalizeDisplayName(row.display_name),
    productCode: hidden ? null : row.product_code,
    wantedToUnderstand: hidden ? null : row.wanted_to_understand,
    mostUseful: row.most_useful,
    hardToUnderstand: row.hard_to_understand.trim() ? row.hard_to_understand : null,
    changedAction: row.changed_action,
    publishedMonth: publishedMonth(row.approved_at ?? row.created_at),
  };
}

export function toPublicReviews(
  rows: readonly StoredReviewRow[],
): readonly PublicReview[] {
  return rows.map(toPublicReview).filter((review): review is PublicReview => review !== null);
}

/**
 * What the reviewer is shown about their own submission. Their own answers are not
 * echoed back: the panel exists so they can see the publication state and take consent
 * away, and re-rendering the text would put it on screen for whoever is looking on.
 */
export function toOwnReviewState(row: StoredReviewRow): OwnReviewState {
  return {
    status: row.status,
    publicConsent: row.public_consent,
    displayName: normalizeDisplayName(row.display_name),
    hideProductContext: row.hide_product_context,
    submittedAt: row.created_at,
  };
}

export type ReviewOutcomeSummary = Readonly<{
  total: number;
  changed: number;
  considering: number;
}>;

/**
 * A count of what reviewers said, used only when there is something to count. It never
 * turns into a score or a star average: four questions and a handful of answers cannot
 * carry one, and a fabricated rating is the first thing that makes evidence untrue.
 */
export function summarizeReviewOutcomes(
  reviews: readonly PublicReview[],
): ReviewOutcomeSummary {
  const count = (action: ChangedAction) =>
    reviews.filter((review) => review.changedAction === action).length;
  return {
    total: reviews.length,
    changed: count("changed"),
    considering: count("considering"),
  };
}
