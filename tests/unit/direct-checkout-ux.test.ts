import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const plans = await readFile("src/components/plans-experience.tsx", "utf8");
const home = await readFile("src/components/home-experience.tsx", "utf8");

describe("direct checkout UX", () => {
  it("uses a direct payment label instead of a payment-method loading step", () => {
    expect(plans).toContain('choose: "바로 결제하기"');
    expect(plans).toContain('choose: "Pay now"');
    expect(plans).not.toContain("결제수단 불러오기");
    expect(plans).not.toContain("Load payment methods");
  });

  it("saves the recovery link and immediately enters PayApp checkout", () => {
    const start = plans.indexOf('if (checkout.provider === "payapp")');
    const end = plans.indexOf("setSession(checkout)", start);
    const directBranch = plans.slice(start, end);

    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(directBranch).toContain("saveGuestReportLink");
    expect(directBranch).toContain("window.location.assign(checkout.payUrl)");
  });
});

describe("simple landing-page hierarchy", () => {
  it("keeps one primary action and only three quiet reflection prompts", () => {
    expect(home.match(/question-bubble question-bubble-/g)).toHaveLength(3);
    expect(home).not.toContain("pythagoras-backdrop");
    expect(home).not.toContain("✦");
    expect(home).toContain("무료 핵심 패턴 · 잠금");
  });
});
