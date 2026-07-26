import { describe, expect, it } from "vitest";
import {
  assessShopLaunch,
  curateCatalog,
  ProductCandidateSchema,
  shopLaunchGateIds,
  type ProductCandidate,
  type ShopLaunchReview,
} from "@/core/commerce";

const product = (overrides: Partial<ProductCandidate> = {}): ProductCandidate => ({
  productRef: "product_12345678",
  supplierRef: "supplier_12345678",
  categoryId: "wearable_accent",
  title: { ko: "무광 실버 포인트", en: "Matte silver accent" },
  summary: {
    ko: "일상 착용을 위한 간결한 형태의 액세서리입니다.",
    en: "A restrained accessory form for everyday wear.",
  },
  materials: ["recycled stainless steel"],
  allergenNotice: {
    ko: "금속 민감성이 있다면 성분을 먼저 확인하세요.",
    en: "Check the composition first if you have metal sensitivities.",
  },
  dimensions: { ko: "폭 8mm", en: "8 mm wide" },
  care: { ko: "부드러운 천으로 닦으세요.", en: "Wipe with a soft cloth." },
  countryOfOrigin: "KR",
  imageAlt: { ko: "무광 실버 액세서리", en: "Matte silver accessory" },
  price: { currency: "KRW", amountMinor: 39000 },
  inventoryState: "in_stock",
  returnWindowDays: 14,
  returnsPolicyUrl: "https://innerarc.example/returns",
  supplierDisclosureUrl: "https://innerarc.example/suppliers/supplier-1",
  sponsored: false,
  organicRelevance: 80,
  marketingClaims: ["간결한 일상 스타일 방향"],
  ...overrides,
});

const gates = (status: "pending" | "approved" | "rejected"): ShopLaunchReview["gates"] =>
  Object.fromEntries(shopLaunchGateIds.map((gateId) => [
    gateId,
    status === "approved"
      ? { status, evidenceRef: `evidence_${gateId}` }
      : { status },
  ])) as ShopLaunchReview["gates"];

const review = (overrides: Partial<ShopLaunchReview> = {}): ShopLaunchReview => ({
  requestedOpen: false,
  explicitOwnerAuthorization: false,
  emergencyKillSwitch: false,
  approvedProductCount: 0,
  reviewedAt: "2026-07-26T00:00:00.000Z",
  gates: gates("pending"),
  ...overrides,
});

describe("future commerce catalog contract", () => {
  it("accepts a fully disclosed claim-free product candidate", () => {
    expect(ProductCandidateSchema.parse(product())).toMatchObject({
      productRef: "product_12345678",
      categoryId: "wearable_accent",
    });
  });

  it.each([
    "행운을 불러오는 팔찌",
    "Love-attracting guaranteed protection",
    "치유 효과를 보장",
  ])("rejects symbolic product outcome claim: %s", (claim) => {
    expect(() => ProductCandidateSchema.parse(product({ marketingClaims: [claim] }))).toThrow();
  });

  it("requires a visible bilingual label for sponsored products", () => {
    expect(() => ProductCandidateSchema.parse(product({ sponsored: true }))).toThrow();
    expect(ProductCandidateSchema.parse(product({
      sponsored: true,
      sponsorshipLabel: { ko: "유료 광고", en: "Paid placement" },
    })).sponsored).toBe(true);
  });

  it("rejects tracking query strings, fragments, and insecure disclosure URLs", () => {
    expect(() => ProductCandidateSchema.parse(product({
      supplierDisclosureUrl: "https://innerarc.example/supplier?email=user@example.com",
    }))).toThrow();
    expect(() => ProductCandidateSchema.parse(product({
      returnsPolicyUrl: "http://innerarc.example/returns",
    }))).toThrow();
  });

  it("keeps sponsored placement separate from organic recommendation order", () => {
    const result = curateCatalog([
      product({ productRef: "organic_12345678", organicRelevance: 60 }),
      product({
        productRef: "sponsor_12345678",
        sponsored: true,
        sponsorshipLabel: { ko: "유료 광고", en: "Paid placement" },
        organicRelevance: 100,
      }),
      product({
        productRef: "carry_123456789",
        categoryId: "everyday_carry",
        organicRelevance: 99,
      }),
    ], ["wearable_accent", "everyday_carry"]);

    expect(result.organic.map((item) => item.productRef)).toEqual([
      "organic_12345678",
      "carry_123456789",
    ]);
    expect(result.sponsored.map((item) => item.productRef)).toEqual(["sponsor_12345678"]);
  });

  it("rejects duplicate products and duplicate recommendation categories", () => {
    expect(() => curateCatalog([product(), product()], ["wearable_accent"])).toThrow("DUPLICATE_PRODUCT_REF");
    expect(() => curateCatalog([product()], ["wearable_accent", "wearable_accent"])).toThrow(
      "DUPLICATE_RECOMMENDED_CATEGORY",
    );
  });
});

describe("shop launch gate", () => {
  it("keeps the shop in coming-later state without an open request", () => {
    const result = assessShopLaunch(review());
    expect(result.state).toBe("coming_later");
    expect(result.canRenderPurchaseControls).toBe(false);
    expect(result.blockedGateIds).toContain("approved_suppliers");
  });

  it("blocks a premature opening and identifies owner authorization", () => {
    const result = assessShopLaunch(review({ requestedOpen: true }));
    expect(result.state).toBe("blocked");
    expect(result.blockedGateIds).toContain("owner_authorization");
    expect(result.blockedGateIds).toContain("approved_products");
  });

  it("requires evidence for every approved gate", () => {
    expect(() => assessShopLaunch(review({
      gates: {
        ...gates("pending"),
        approved_suppliers: { status: "approved" },
      },
    }))).toThrow();
  });

  it("reaches readiness without rendering purchase controls", () => {
    const result = assessShopLaunch(review({
      requestedOpen: true,
      explicitOwnerAuthorization: true,
      approvedProductCount: 3,
      gates: gates("approved"),
    }));
    expect(result).toEqual({
      state: "ready_for_authorized_deployment",
      blockedGateIds: [],
      canRenderPurchaseControls: false,
    });
  });

  it("lets the emergency kill switch override an otherwise ready review", () => {
    const result = assessShopLaunch(review({
      requestedOpen: true,
      explicitOwnerAuthorization: true,
      emergencyKillSwitch: true,
      approvedProductCount: 3,
      gates: gates("approved"),
    }));
    expect(result.state).toBe("blocked");
    expect(result.blockedGateIds).toEqual(["emergency_kill_switch"]);
  });
});
