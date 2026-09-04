import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { getHomeFaq } from "@/i18n/home-faq";
import { getLocalizedSiteMetadata } from "@/i18n/site-metadata";
import { resolveProductPricing } from "@/core/product-prices";

const homeExperience = await readFile("src/components/home-experience.tsx", "utf8");
const localeLayout = await readFile("src/app/[locale]/layout.tsx", "utf8");
const rootPage = await readFile("src/app/page.tsx", "utf8");
const rootLayout = await readFile("src/app/layout.tsx", "utf8");

describe("what a stranger sees before they arrive", () => {
  /**
   * The description in a search result is the only sentence most people will ever read
   * about this product. It used to describe the machinery — "상징 분석을 가설로 제시",
   * "Reality Check" — which is accurate and answers a question nobody asked.
   */
  it("says the areas in the words people search with", () => {
    const ko = getLocalizedSiteMetadata("ko");
    for (const area of [/연애/, /돈|재물/, /일|진로/, /공부|학업|시험/]) {
      expect(ko.title + ko.description).toMatch(area);
    }
    expect(ko.description).not.toMatch(/Reality Check|결정론|상징 분석을 가설/);
  });

  it("keeps the page's answers and the structured data the same words", () => {
    // Google honours FAQ markup only when a reader can see the same text, so both read one
    // module. This guards the refactor that made that true, not the strings themselves.
    expect(homeExperience).toContain('getHomeFaq(locale, pricing.prices.pro_30d)');
    expect(localeLayout).toContain('getHomeFaq(locale, pricing.prices.pro_30d)');
    expect(homeExperience).toContain('id="faq"');
    expect(localeLayout).toContain('"@type": "FAQPage"');
    expect(localeLayout).toContain('"@type": "Service"');
  });

  it("answers the five questions a search visitor actually arrives with", () => {
    const pricing = resolveProductPricing();
    for (const locale of ["ko", "en"] as const) {
      const faq = getHomeFaq(locale, pricing.prices.pro_30d);
      expect(faq).toHaveLength(5);
      for (const [question, answer] of faq) {
        expect(question.length).toBeGreaterThan(6);
        expect(answer.length).toBeGreaterThan(40);
      }
    }

    const ko = getHomeFaq("ko", pricing.prices.pro_30d);
    const spoken = ko.map(([question, answer]) => `${question} ${answer}`).join(" ");
    // What is free, what a study concern gets, and what the reading costs, all answerable
    // without leaving the page.
    expect(spoken).toMatch(/무료/);
    expect(spoken).toMatch(/공부|시험/);
    expect(spoken).toContain(pricing.prices.pro_30d.toLocaleString("ko-KR"));
    // And the claims it must never make, including the comparative one this copy is most
    // tempted toward: it is asked "점집과 뭐가 다른가요" and must answer procedurally.
    expect(spoken).not.toMatch(/보장|반드시|확실히|적중|예언|맞춰드립/);
    expect(spoken).not.toMatch(/점집보다|사주보다|무당보다|더 정확/);
    expect(spoken).toMatch(/예측하거나 진단하지 않습니다/);
  });

  it("keeps the crawler's path to the pages that should rank", () => {
    // A temporary redirect leaves the ranking signals on an address that is never coming
    // back; this one is permanent.
    expect(rootPage).toContain("permanentRedirect");
    expect(rootPage).not.toContain('redirect("/ko")');
    // Ownership proof for both search consoles: Naver's is a committed public token, and
    // Google's arrives from the environment so it can be added without a code change.
    expect(rootLayout).toContain("naver-site-verification");
    expect(rootLayout).toContain("GOOGLE_SITE_VERIFICATION");
  });
});
