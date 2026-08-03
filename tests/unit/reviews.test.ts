import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  ReviewSubmissionSchema,
  isAllowedDisplayName,
  normalizeDisplayName,
  publishedMonth,
  resolveReviewType,
  summarizeReviewOutcomes,
  toOwnReviewState,
  toPublicReview,
  toPublicReviews,
  type StoredReviewRow,
} from "@/core/reviews";

/**
 * These assertions are about what the code does, so the prose explaining it has to come
 * out first — otherwise a comment saying "no placeholder here" reads as a placeholder.
 */
function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*(\/\/|--).*$/gm, "");
}

const storedReview: StoredReviewRow = {
  id: "0f2a5d3e-6b1c-4a7f-9a2d-0c8f1b3e5d7a",
  order_id: "ia20260803abc",
  review_type: "verified_purchaser",
  product_code: "pro_30d",
  locale: "ko",
  wanted_to_understand: "이직을 지금 준비해야 할지 알고 싶었어요.",
  most_useful: "멈춰야 하는 신호를 구체적으로 적어준 부분이요.",
  hard_to_understand: "숫자 계산 근거는 조금 어려웠어요.",
  changed_action: "changed",
  public_consent: true,
  display_name: "조용한 독자",
  hide_product_context: false,
  status: "approved",
  admin_note: "본인 확인함",
  created_at: "2026-08-01T02:00:00.000Z",
  updated_at: "2026-08-02T02:00:00.000Z",
  approved_at: "2026-08-02T02:00:00.000Z",
  consent_withdrawn_at: null,
};

describe("the label a review carries", () => {
  it("calls a confirmed paid order a verified purchase and nothing else", () => {
    expect(resolveReviewType({ status: "DONE", amount: 39_000 })).toBe("verified_purchaser");
  });

  it("labels a zero-amount reading as free rather than purchased", () => {
    expect(resolveReviewType({ status: "DONE", amount: 0 })).toBe("free_reading");
  });

  it("refuses any label for an order the provider has not confirmed", () => {
    for (const status of ["CREATED", "WAITING_FOR_DEPOSIT", "CANCELED", "EXPIRED"]) {
      expect(resolveReviewType({ status, amount: 39_000 })).toBeNull();
    }
    expect(resolveReviewType(null)).toBeNull();
  });
});

describe("what a stranger is allowed to see", () => {
  it("publishes only an approved review that still carries consent", () => {
    expect(toPublicReview(storedReview)).not.toBeNull();
    expect(toPublicReview({ ...storedReview, status: "pending" })).toBeNull();
    expect(toPublicReview({ ...storedReview, status: "rejected" })).toBeNull();
    expect(toPublicReview({ ...storedReview, status: "withdrawn" })).toBeNull();
    // Consent withdrawn after approval removes it on the very next render.
    expect(toPublicReview({ ...storedReview, public_consent: false })).toBeNull();
  });

  it("never carries the order number, the operator note, or a timestamp outward", () => {
    const published = toPublicReview(storedReview);
    const serialized = JSON.stringify(published);
    expect(serialized).not.toContain(storedReview.order_id);
    expect(serialized).not.toContain(storedReview.admin_note);
    expect(serialized).not.toContain(storedReview.created_at);
    expect(Object.keys(published ?? {}).sort()).toEqual([
      "changedAction",
      "displayName",
      "hardToUnderstand",
      "id",
      "mostUseful",
      "productCode",
      "publishedMonth",
      "reviewType",
      "wantedToUnderstand",
    ]);
  });

  it("drops the product and the reviewer's own situation when they asked it hidden", () => {
    const hidden = toPublicReview({ ...storedReview, hide_product_context: true });
    expect(hidden?.productCode).toBeNull();
    expect(hidden?.wantedToUnderstand).toBeNull();
    // The useful answer is what they consented to publish, so it stays.
    expect(hidden?.mostUseful).toBe(storedReview.most_useful);
  });

  it("dates a review to the month, not the second that identifies one order", () => {
    expect(publishedMonth("2026-08-02T02:00:00.000Z")).toBe("2026-08");
    expect(publishedMonth("not a date")).toBe("");
    expect(toPublicReview(storedReview)?.publishedMonth).toBe("2026-08");
  });

  it("filters a mixed list down to the publishable ones", () => {
    const published = toPublicReviews([
      storedReview,
      { ...storedReview, id: "b", status: "pending" },
      { ...storedReview, id: "c", public_consent: false },
    ]);
    expect(published).toHaveLength(1);
  });

  it("counts outcomes without inventing a score", () => {
    const summary = summarizeReviewOutcomes(toPublicReviews([
      storedReview,
      { ...storedReview, id: "b", changed_action: "considering" },
      { ...storedReview, id: "c", changed_action: "unchanged" },
    ]));
    expect(summary).toEqual({ total: 3, changed: 1, considering: 1 });
  });
});

describe("the reviewer's own view of their submission", () => {
  it("shows the state and the consent flag without echoing their answers back", () => {
    const own = toOwnReviewState(storedReview);
    expect(own.status).toBe("approved");
    expect(own.publicConsent).toBe(true);
    expect(JSON.stringify(own)).not.toContain(storedReview.wanted_to_understand);
  });
});

describe("an anonymous display name stays anonymous", () => {
  it("accepts a short nickname in either language and a blank choice", () => {
    for (const name of ["익명", "조용한 독자", "A reader", "reader_01", ""]) {
      expect(isAllowedDisplayName(name), name).toBe(true);
    }
  });

  it("rejects a contact detail or a number long enough to identify someone", () => {
    for (const name of ["a@b.com", "http://x.kr", "01012345678", "1994-11-04", "010 1234"]) {
      expect(isAllowedDisplayName(name), name).toBe(false);
    }
  });

  it("stores nothing rather than storing a rejected name", () => {
    expect(normalizeDisplayName("  조용한   독자 ")).toBe("조용한 독자");
    expect(normalizeDisplayName("qkrehgus5886@naver.com")).toBe("");
  });
});

describe("what the submission form will accept", () => {
  const valid = {
    wantedToUnderstand: "이직 시기를 정하고 싶었습니다.",
    mostUseful: "멈춰야 하는 조건이 구체적이었습니다.",
    changedAction: "changed" as const,
  };

  it("treats consent as absent unless it is given", () => {
    const parsed = ReviewSubmissionSchema.parse(valid);
    expect(parsed.publicConsent).toBe(false);
    expect(parsed.hideProductContext).toBe(false);
    expect(parsed.displayName).toBe("");
  });

  it("refuses a review type chosen by whoever is filling in the form", () => {
    expect(() => ReviewSubmissionSchema.parse({ ...valid, reviewType: "verified_purchaser" }))
      .toThrow();
  });

  it("bounds every answer it stores", () => {
    expect(() => ReviewSubmissionSchema.parse({ ...valid, mostUseful: "짧음" })).toThrow();
    expect(() => ReviewSubmissionSchema.parse({ ...valid, mostUseful: "가".repeat(601) }))
      .toThrow();
    expect(() => ReviewSubmissionSchema.parse({ ...valid, changedAction: "amazing" })).toThrow();
    expect(() => ReviewSubmissionSchema.parse({ ...valid, displayName: "01012345678" }))
      .toThrow();
  });
});

describe("nothing publishes itself", () => {
  it("writes new reviews as pending and leaves approval to the console", async () => {
    const repository = withoutComments(await readFile("src/server/reviews.ts", "utf8"));
    expect(repository).toContain('status: "pending"');
    // The insert path must not be able to write an approved row.
    const insertBlock = repository.slice(
      repository.indexOf("export async function saveReview"),
      repository.indexOf("export async function setReviewPublicConsent"),
    );
    expect(insertBlock).not.toContain('"approved"');
  });

  it("keeps approval behind the administrator allowlist", async () => {
    const route = await readFile("src/app/api/admin/reviews/[id]/route.ts", "utf8");
    expect(route).toContain("isAdminEmail");
    expect(route).toContain("isSameOriginRequest");
  });

  it("accepts a review only from a browser that can open the completed reading", async () => {
    const route = await readFile("src/app/api/reviews/route.ts", "utf8");
    expect(route).toContain("authorizeReviewForOrder");
    expect(route).toContain("isSameOriginRequest");
    const repository = await readFile("src/server/reviews.ts", "utf8");
    expect(repository).toContain("getAuthorizedStoredReport");
    expect(repository).toContain('stored.status !== "ready"');
  });
});

describe("an empty review wall shows evidence, not empty cards", () => {
  it("renders product evidence, method, and FAQ when nothing is approved", async () => {
    const section = withoutComments(
      await readFile("src/components/review-evidence-section.tsx", "utf8"),
    );
    expect(section).toContain("evidenceTitle");
    expect(section).toContain("methodTitle");
    expect(section).toContain("faqTitle");
    // No placeholder card, no "coming soon", no fabricated review.
    expect(section).not.toMatch(/coming soon|준비\s*중입니다|lorem ipsum/i);
  });

  it("states plainly that reviews are not invented", async () => {
    const copy = await readFile("src/i18n/evidence-copy.ts", "utf8");
    expect(copy).toContain("후기를 지어내지 않습니다");
    expect(copy).toContain("We do not invent reviews");
  });
});

describe("the review migration stays out of payment territory", () => {
  it("adds one table and alters no existing one", async () => {
    const migration = withoutComments(await readFile(
      "supabase/migrations/20260803000100_review_collection.sql",
      "utf8",
    ));
    expect(migration).toContain("create table if not exists public.product_reviews");
    expect(migration).not.toMatch(/alter table public\.(payment_orders|purchased_reports)/);
    expect(migration).not.toMatch(/drop (table|column)/);
    expect(migration).not.toMatch(/references public\.payment_orders/);
    // Locked to the service role like every other operator-only table.
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on table public.product_reviews from public, anon, authenticated");
  });

  it("collects no birth date, concern text, or payment field", async () => {
    const migration = withoutComments(await readFile(
      "supabase/migrations/20260803000100_review_collection.sql",
      "utf8",
    ));
    for (const forbidden of ["birth_date", "concern", "payment_key", "customer_phone", "amount"]) {
      expect(migration.includes(`${forbidden} `), forbidden).toBe(false);
    }
  });
});
