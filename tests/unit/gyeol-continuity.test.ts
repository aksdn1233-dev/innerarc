import { describe, expect, it } from "vitest";
import { buildGyeolContinuity } from "@/core/continuity/gyeol-continuity";

describe("GYEOL continuity", () => {
  it("prioritizes owned reports and user-saved outcome history", () => {
    expect(buildGyeolContinuity({
      locale: "ko",
      paidReportCount: 2,
      latestPaidReportHref: "/ko/reports/order-2",
      realityCheckCount: 3,
      tarotReadingCount: 4,
      dailyFlowEnabled: true,
    }).map((item) => item.kind)).toEqual(["paid_report", "reality_check", "daily_flow"]);
  });

  it("does not fabricate change when only deterministic Daily Flow is available", () => {
    const [action] = buildGyeolContinuity({
      locale: "ko",
      paidReportCount: 0,
      realityCheckCount: 0,
      tarotReadingCount: 0,
      dailyFlowEnabled: true,
    });
    expect(action.kind).toBe("daily_flow");
    expect(action.description).toContain("날짜가 같으면 계산 결과도 바뀌지 않아요");
  });

  it("offers an honest first reflection when there is no saved value", () => {
    const [action] = buildGyeolContinuity({
      locale: "en",
      paidReportCount: 0,
      realityCheckCount: 0,
      tarotReadingCount: 0,
      dailyFlowEnabled: false,
    });
    expect(action).toMatchObject({ kind: "first_reflection", href: "/en/numerology" });
  });
});
