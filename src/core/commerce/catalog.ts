import { z } from "zod";
import { accessoryCategoryIds } from "@/core/lifestyle";

const OpaqueRefSchema = z.string().regex(/^[A-Za-z0-9_-]{8,120}$/);
const PublicHttpsUrlSchema = z.string().url().superRefine((value, context) => {
  const url = new URL(value);
  if (url.protocol !== "https:") {
    context.addIssue({ code: "custom", message: "Public commerce URLs must use HTTPS" });
  }
  if (url.username || url.password || url.search || url.hash) {
    context.addIssue({
      code: "custom",
      message: "Public commerce URLs cannot contain credentials, query parameters, or fragments",
    });
  }
});

const LocalizedProductCopySchema = z.object({
  ko: z.string().trim().min(1).max(280),
  en: z.string().trim().min(1).max(280),
}).strict();

const prohibitedCommerceClaim =
  /\b(?:luck(?:y)?|heal(?:s|ing)?|cure(?:s|d)?|protect(?:s|ion)?|guarantee(?:s|d)?|attracts?\s+(?:love|money))\b|행운|치유|치료|재물운|연애운|사랑을\s*끌|돈을\s*끌|반드시|보장/iu;

export const ProductCandidateSchema = z.object({
  productRef: OpaqueRefSchema,
  supplierRef: OpaqueRefSchema,
  categoryId: z.enum(accessoryCategoryIds),
  title: LocalizedProductCopySchema,
  summary: LocalizedProductCopySchema,
  materials: z.array(z.string().trim().min(1).max(80)).min(1).max(12),
  allergenNotice: LocalizedProductCopySchema,
  dimensions: LocalizedProductCopySchema,
  care: LocalizedProductCopySchema,
  countryOfOrigin: z.string().regex(/^[A-Z]{2}$/),
  imageAlt: LocalizedProductCopySchema,
  price: z.object({
    currency: z.enum(["KRW", "USD"]),
    amountMinor: z.number().int().positive(),
  }).strict(),
  inventoryState: z.enum(["in_stock", "preorder", "unavailable"]),
  returnWindowDays: z.number().int().min(0).max(90),
  returnsPolicyUrl: PublicHttpsUrlSchema,
  supplierDisclosureUrl: PublicHttpsUrlSchema,
  sponsored: z.boolean(),
  sponsorshipLabel: LocalizedProductCopySchema.optional(),
  organicRelevance: z.number().int().min(0).max(100),
  marketingClaims: z.array(z.string().trim().min(1).max(160)).max(12),
}).strict().superRefine((candidate, context) => {
  if (candidate.sponsored && !candidate.sponsorshipLabel) {
    context.addIssue({
      code: "custom",
      path: ["sponsorshipLabel"],
      message: "Sponsored products require a bilingual sponsorship label",
    });
  }
  if (!candidate.sponsored && candidate.sponsorshipLabel) {
    context.addIssue({
      code: "custom",
      path: ["sponsorshipLabel"],
      message: "Organic products cannot carry a sponsorship label",
    });
  }

  const claims = [
    candidate.title.ko,
    candidate.title.en,
    candidate.summary.ko,
    candidate.summary.en,
    ...candidate.marketingClaims,
  ];
  if (claims.some((claim) => prohibitedCommerceClaim.test(claim))) {
    context.addIssue({
      code: "custom",
      path: ["marketingClaims"],
      message: "Luck, protection, healing, guaranteed-outcome, and attraction claims are prohibited",
    });
  }
});
export type ProductCandidate = z.infer<typeof ProductCandidateSchema>;

export type CatalogCuration = Readonly<{
  organic: readonly ProductCandidate[];
  sponsored: readonly ProductCandidate[];
  rankingBasis: "symbolic_category_then_organic_relevance";
}>;

function uniqueProductCandidates(candidates: unknown): ProductCandidate[] {
  const parsed = z.array(ProductCandidateSchema).max(500).parse(candidates);
  const refs = new Set<string>();
  for (const candidate of parsed) {
    if (refs.has(candidate.productRef)) throw new TypeError("DUPLICATE_PRODUCT_REF");
    refs.add(candidate.productRef);
  }
  return parsed;
}

export function curateCatalog(
  candidates: unknown,
  recommendedCategories: readonly (typeof accessoryCategoryIds)[number][],
): CatalogCuration {
  const categoryOrder = z.array(z.enum(accessoryCategoryIds)).min(1).max(3).parse(recommendedCategories);
  if (new Set(categoryOrder).size !== categoryOrder.length) {
    throw new TypeError("DUPLICATE_RECOMMENDED_CATEGORY");
  }
  const categoryRank = new Map(categoryOrder.map((category, index) => [category, index]));
  const eligible = uniqueProductCandidates(candidates)
    .filter((candidate) => candidate.inventoryState !== "unavailable")
    .filter((candidate) => categoryRank.has(candidate.categoryId));
  const order = (left: ProductCandidate, right: ProductCandidate): number =>
    (categoryRank.get(left.categoryId) ?? Number.MAX_SAFE_INTEGER)
    - (categoryRank.get(right.categoryId) ?? Number.MAX_SAFE_INTEGER)
    || right.organicRelevance - left.organicRelevance
    || left.productRef.localeCompare(right.productRef);

  return {
    organic: eligible.filter((candidate) => !candidate.sponsored).sort(order),
    sponsored: eligible.filter((candidate) => candidate.sponsored).sort(order),
    rankingBasis: "symbolic_category_then_organic_relevance",
  };
}

export const shopLaunchGateIds = [
  "approved_suppliers",
  "product_disclosures",
  "consumer_law",
  "returns_refunds",
  "tax_pricing",
  "inventory_fulfillment",
  "payment_security",
  "privacy_dpa",
  "support_incidents",
  "accessibility",
  "content_claim_review",
  "demand_evidence",
] as const;
export type ShopLaunchGateId = (typeof shopLaunchGateIds)[number];

const GateReviewSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  evidenceRef: OpaqueRefSchema.optional(),
}).strict().superRefine((review, context) => {
  if (review.status === "approved" && !review.evidenceRef) {
    context.addIssue({
      code: "custom",
      path: ["evidenceRef"],
      message: "Approved commerce gates require an auditable evidence reference",
    });
  }
});

const ShopLaunchGatesSchema = z.object({
  approved_suppliers: GateReviewSchema,
  product_disclosures: GateReviewSchema,
  consumer_law: GateReviewSchema,
  returns_refunds: GateReviewSchema,
  tax_pricing: GateReviewSchema,
  inventory_fulfillment: GateReviewSchema,
  payment_security: GateReviewSchema,
  privacy_dpa: GateReviewSchema,
  support_incidents: GateReviewSchema,
  accessibility: GateReviewSchema,
  content_claim_review: GateReviewSchema,
  demand_evidence: GateReviewSchema,
}).strict();

export const ShopLaunchReviewSchema = z.object({
  requestedOpen: z.boolean(),
  explicitOwnerAuthorization: z.boolean(),
  emergencyKillSwitch: z.boolean(),
  approvedProductCount: z.number().int().min(0).max(100_000),
  reviewedAt: z.string().datetime({ offset: true }),
  gates: ShopLaunchGatesSchema,
}).strict();
export type ShopLaunchReview = z.infer<typeof ShopLaunchReviewSchema>;

export type ShopLaunchAssessment = Readonly<{
  state: "coming_later" | "blocked" | "ready_for_authorized_deployment";
  blockedGateIds: readonly (ShopLaunchGateId | "approved_products" | "owner_authorization" | "emergency_kill_switch")[];
  canRenderPurchaseControls: false;
}>;

export function assessShopLaunch(candidate: unknown): ShopLaunchAssessment {
  const review = ShopLaunchReviewSchema.parse(candidate);
  const blockedGateIds: Array<
    ShopLaunchGateId | "approved_products" | "owner_authorization" | "emergency_kill_switch"
  > = shopLaunchGateIds.filter((gateId) => review.gates[gateId].status !== "approved");

  if (review.approvedProductCount === 0) blockedGateIds.push("approved_products");
  if (!review.explicitOwnerAuthorization) blockedGateIds.push("owner_authorization");
  if (review.emergencyKillSwitch) blockedGateIds.unshift("emergency_kill_switch");

  if (!review.requestedOpen) {
    return { state: "coming_later", blockedGateIds, canRenderPurchaseControls: false };
  }
  if (blockedGateIds.length > 0) {
    return { state: "blocked", blockedGateIds, canRenderPurchaseControls: false };
  }
  return {
    state: "ready_for_authorized_deployment",
    blockedGateIds: [],
    canRenderPurchaseControls: false,
  };
}
