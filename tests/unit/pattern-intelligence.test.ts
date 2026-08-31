import { describe, expect, it } from "vitest";
import {
  confidenceLabel,
  confidenceRevisionReason,
  EvidenceEventInputSchema,
  ReportRealityCheckInputSchema,
  revisePatternConfidence,
} from "@/core/pattern-intelligence";
import { inferReportSourceSystem } from "@/server/pattern-intelligence";
import type { PaidReport } from "@/core/paid-reading";

describe("conservative pattern confidence", () => {
  it("moves feedback by small transparent increments and keeps a sparse-evidence cap", () => {
    expect(revisePatternConfidence({ previousConfidence: 0.45, evidenceCount: 0, response: "MATCH" })).toBe(0.49);
    expect(revisePatternConfidence({ previousConfidence: 0.45, evidenceCount: 0, response: "PARTIAL" })).toBe(0.46);
    expect(revisePatternConfidence({ previousConfidence: 0.45, evidenceCount: 0, response: "MISMATCH" })).toBe(0.37);
    expect(revisePatternConfidence({ previousConfidence: 0.73, evidenceCount: 3, response: "MATCH" })).toBe(0.74);
  });

  it("weights confirmed evidence more than casual feedback and preserves ambiguity", () => {
    const support = revisePatternConfidence({ previousConfidence: 0.45, evidenceCount: 5, response: "EVIDENCE_SUPPORT" });
    const match = revisePatternConfidence({ previousConfidence: 0.45, evidenceCount: 5, response: "MATCH" });
    expect(support).toBeGreaterThan(match);
    expect(revisePatternConfidence({ previousConfidence: 0.45, evidenceCount: 5, response: "EVIDENCE_AMBIGUOUS" })).toBe(0.45);
    expect(confidenceRevisionReason({ previousConfidence: 0.45, evidenceCount: 5, response: "CONTEXT_DEPENDENT" }))
      .toBe("reality_check_context_increases_uncertainty");
  });

  it("uses human-readable states instead of rendering fake precision", () => {
    expect(confidenceLabel(0.9, 1)).toBe("검증 중");
    expect(confidenceLabel(0.35, 3)).toBe("낮음");
    expect(confidenceLabel(0.62, 3)).toBe("보통");
    expect(confidenceLabel(0.74, 7)).toBe("높음");
  });
});

describe("pattern write contracts", () => {
  it("accepts the four machine-readable Reality Check responses", () => {
    for (const response of ["MATCH", "PARTIAL", "MISMATCH", "CONTEXT_DEPENDENT"] as const) {
      expect(ReportRealityCheckInputSchema.safeParse({
        orderId: "order_123456",
        sectionIndex: 0,
        response,
        note: "short",
        clientRequestId: `reality:${response}`,
      }).success).toBe(true);
    }
  });

  it("requires a complete optional evidence-to-hypothesis link", () => {
    const base = {
      eventType: "job_change",
      lifeDomain: "work",
      eventDate: "2026-08-30",
      approximateDate: false,
      shortDescription: "Changed teams",
      outcome: "mixed",
      relationshipContext: "",
      clientRequestId: "event:12345678",
    };
    expect(EvidenceEventInputSchema.safeParse(base).success).toBe(true);
    expect(EvidenceEventInputSchema.safeParse({ ...base, orderId: "order_123456" }).success).toBe(false);
    expect(EvidenceEventInputSchema.safeParse({
      ...base,
      orderId: "order_123456",
      sectionIndex: 2,
      relation: "SUPPORT",
    }).success).toBe(true);
  });
});

describe("report provenance source", () => {
  const report = { contentVersion: "numerology-paid-v1" } as PaidReport;

  it("keeps numerology as the default for legacy paid reports", () => {
    expect(inferReportSourceSystem(report)).toBe("numerology");
  });

  it("identifies deterministic Four Pillars reports from their versioned source", () => {
    expect(inferReportSourceSystem({ ...report, contentVersion: "saju-chart-report-1.2.0" })).toBe("saju");
  });
});
