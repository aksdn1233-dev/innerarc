import { describe, expect, it } from "vitest";
import { createReportProvenance, provenanceMetaTags } from "@/server/report-provenance";

const environment = { PROVENANCE_HMAC_SECRET: "p".repeat(32) };

describe("report and export provenance", () => {
  it("omits identifiers when the server secret is absent", () => {
    expect(createReportProvenance({ reportId: "order_123", ownerScope: "owner_123", content: "hello", environment: {} })).toBeNull();
  });

  it("creates stable owner/content references and a unique export reference without exposing the owner", () => {
    const first = createReportProvenance({ reportId: "order_123", ownerScope: "owner-sensitive", content: "hello", environment, exportId: `exp_${"a".repeat(32)}` })!;
    const second = createReportProvenance({ reportId: "order_123", ownerScope: "owner-sensitive", content: "hello", environment, exportId: `exp_${"b".repeat(32)}` })!;
    expect(first.provenanceId).toBe(second.provenanceId);
    expect(first.contentFingerprint).toBe(second.contentFingerprint);
    expect(first.exportId).not.toBe(second.exportId);
    expect(JSON.stringify(first)).not.toContain("owner-sensitive");
    expect(first.canaryMarker).toBeNull();
  });

  it("renders non-semantic metadata only", () => {
    const value = createReportProvenance({ reportId: "order_123", ownerScope: "owner_123", content: "hello", environment, exportId: `exp_${"c".repeat(32)}` })!;
    const tags = provenanceMetaTags(value);
    expect(tags).toContain("taeryeongdang:provenance-id");
    expect(tags).toContain("taeryeongdang:content-fingerprint");
    expect(tags).not.toMatch(/display|fortune|prediction/i);
  });
});
