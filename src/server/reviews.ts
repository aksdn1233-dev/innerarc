import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isReviewProductCode,
  normalizeDisplayName,
  resolveReviewType,
  toPublicReviews,
  type ParsedReviewSubmission,
  type PublicReview,
  type ReviewStatus,
  type ReviewType,
  type StoredReviewRow,
} from "@/core/reviews";
import { getAuthorizedStoredReport } from "@/server/reports/access";

const REVIEW_COLUMNS =
  "id,order_id,review_type,product_code,locale,wanted_to_understand,most_useful," +
  "hard_to_understand,changed_action,public_consent,display_name,hide_product_context," +
  "status,admin_note,created_at,updated_at,approved_at,consent_withdrawn_at";

/**
 * Reviews are a later addition, so a deployment can legitimately be running with the
 * migration unapplied. Every read here answers with `available: false` rather than
 * throwing: a missing review table must not take down the home page or the console.
 */
export type ReviewQueryResult<T> = Readonly<{ available: boolean; data: T }>;

export type ReviewAuthorization =
  | Readonly<{
      ok: true;
      orderId: string;
      reviewType: ReviewType;
      productCode: string | null;
      locale: "ko" | "en";
    }>
  | Readonly<{ ok: false; reason: "NOT_AUTHORIZED" | "READING_NOT_COMPLETE" }>;

/**
 * Proof that this browser has actually opened this completed reading.
 *
 * It reuses the exact check the report page itself runs — the guest access token, the
 * signed return ticket or order pass, the phone-number lookup proof, or account
 * ownership — so a review can only be created by someone who could already read the
 * report. Nobody can post a review for an order they merely know the number of.
 */
export async function authorizeReviewForOrder(input: Readonly<{
  admin: SupabaseClient;
  orderId: string;
  userId?: string;
  accessToken?: string;
  lookupProof?: string;
  provenOrderId?: string;
}>): Promise<ReviewAuthorization> {
  const stored = await getAuthorizedStoredReport({
    admin: input.admin,
    orderId: input.orderId,
    userId: input.userId,
    accessToken: input.accessToken,
    lookupProof: input.lookupProof,
    provenOrderId: input.provenOrderId,
  });
  if (!stored) return { ok: false, reason: "NOT_AUTHORIZED" };
  // A reading that is still waiting on payment, failed to build, or was revoked after a
  // refund is not something the reviewer has read.
  if (stored.status !== "ready") return { ok: false, reason: "READING_NOT_COMPLETE" };

  const { data: order } = await input.admin
    .from("payment_orders")
    .select("status,amount,product_code")
    .eq("order_id", input.orderId)
    .maybeSingle();
  const reviewType = resolveReviewType(
    order ? { status: String(order.status), amount: Number(order.amount ?? 0) } : null,
  );
  if (!reviewType) return { ok: false, reason: "READING_NOT_COMPLETE" };

  const { data: report } = await input.admin
    .from("purchased_reports")
    .select("locale,product_code")
    .eq("order_id", input.orderId)
    .maybeSingle();

  return {
    ok: true,
    orderId: input.orderId,
    reviewType,
    productCode: isReviewProductCode(order?.product_code)
      ? order.product_code
      : isReviewProductCode(report?.product_code)
        ? report.product_code
        : null,
    locale: report?.locale === "en" ? "en" : "ko",
  };
}

export async function findReviewByOrderId(
  admin: SupabaseClient,
  orderId: string,
): Promise<ReviewQueryResult<StoredReviewRow | null>> {
  const { data, error } = await admin
    .from("product_reviews")
    .select(REVIEW_COLUMNS)
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) return { available: false, data: null };
  return { available: true, data: (data as StoredReviewRow | null) ?? null };
}

export type ReviewSaveResult =
  | Readonly<{ ok: true }>
  | Readonly<{ ok: false; reason: "ALREADY_REVIEWED" | "UNAVAILABLE" }>;

/**
 * Stores one review per order, always as 'pending'. There is no argument that lets a
 * caller write 'approved': publication is a separate administrator action.
 */
export async function saveReview(
  admin: SupabaseClient,
  input: Readonly<{
    authorization: Extract<ReviewAuthorization, { ok: true }>;
    submission: ParsedReviewSubmission;
  }>,
): Promise<ReviewSaveResult> {
  const existing = await findReviewByOrderId(admin, input.authorization.orderId);
  if (!existing.available) return { ok: false, reason: "UNAVAILABLE" };
  if (existing.data) return { ok: false, reason: "ALREADY_REVIEWED" };

  const { error } = await admin.from("product_reviews").insert({
    order_id: input.authorization.orderId,
    review_type: input.authorization.reviewType,
    product_code: input.authorization.productCode,
    locale: input.authorization.locale,
    wanted_to_understand: input.submission.wantedToUnderstand,
    most_useful: input.submission.mostUseful,
    hard_to_understand: input.submission.hardToUnderstand,
    changed_action: input.submission.changedAction,
    public_consent: input.submission.publicConsent,
    display_name: normalizeDisplayName(input.submission.displayName),
    hide_product_context: input.submission.hideProductContext,
    status: "pending",
  });
  if (error) {
    // The unique order index is the race-condition guard for a double submit.
    return {
      ok: false,
      reason: /duplicate key|unique/i.test(error.message) ? "ALREADY_REVIEWED" : "UNAVAILABLE",
    };
  }
  return { ok: true };
}

/**
 * Withdrawing consent hides the review immediately and everywhere, because the public
 * projection requires both an approval and a live consent flag.
 *
 * Granting consent again does not restore the old approval: the review returns to the
 * moderation queue, so nothing reappears in public without a person looking at it.
 */
export async function setReviewPublicConsent(
  admin: SupabaseClient,
  orderId: string,
  publicConsent: boolean,
): Promise<ReviewSaveResult> {
  const existing = await findReviewByOrderId(admin, orderId);
  if (!existing.available) return { ok: false, reason: "UNAVAILABLE" };
  if (!existing.data) return { ok: false, reason: "UNAVAILABLE" };

  const now = new Date().toISOString();
  const { error } = await admin
    .from("product_reviews")
    .update(
      publicConsent
        ? {
            public_consent: true,
            status: "pending",
            approved_at: null,
            consent_withdrawn_at: null,
            updated_at: now,
          }
        : {
            public_consent: false,
            status: "withdrawn",
            consent_withdrawn_at: now,
            updated_at: now,
          },
    )
    .eq("order_id", orderId);
  if (error) return { ok: false, reason: "UNAVAILABLE" };
  return { ok: true };
}

/** The public surface. Approved and still consented only; see `toPublicReview`. */
export async function listPublicReviews(
  admin: SupabaseClient,
  locale: "ko" | "en",
  limit = 6,
): Promise<ReviewQueryResult<readonly PublicReview[]>> {
  const { data, error } = await admin
    .from("product_reviews")
    .select(REVIEW_COLUMNS)
    .eq("locale", locale)
    .eq("status", "approved")
    .eq("public_consent", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { available: false, data: [] };
  return {
    available: true,
    data: toPublicReviews((data ?? []) as unknown as StoredReviewRow[]),
  };
}

export async function listReviewsForModeration(
  admin: SupabaseClient,
  limit = 30,
): Promise<ReviewQueryResult<readonly StoredReviewRow[]>> {
  const { data, error } = await admin
    .from("product_reviews")
    .select(REVIEW_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { available: false, data: [] };
  return { available: true, data: (data ?? []) as unknown as StoredReviewRow[] };
}

export async function countPendingReviews(
  admin: SupabaseClient,
): Promise<ReviewQueryResult<number>> {
  const { count, error } = await admin
    .from("product_reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
    .eq("public_consent", true);
  if (error) return { available: false, data: 0 };
  return { available: true, data: count ?? 0 };
}

export async function moderateReview(
  admin: SupabaseClient,
  id: string,
  input: Readonly<{ status: ReviewStatus; reviewType?: ReviewType; adminNote?: string }>,
): Promise<boolean> {
  const now = new Date().toISOString();
  const { error } = await admin
    .from("product_reviews")
    .update({
      status: input.status,
      ...(input.reviewType ? { review_type: input.reviewType } : {}),
      ...(input.adminNote === undefined ? {} : { admin_note: input.adminNote }),
      approved_at: input.status === "approved" ? now : null,
      updated_at: now,
    })
    .eq("id", id);
  return !error;
}
