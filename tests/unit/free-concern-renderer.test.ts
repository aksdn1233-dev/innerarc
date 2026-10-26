import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FreeConcernReadingCard } from "@/components/free-concern-reading";
import { createFreeConcernReading } from "@/core/free-concern-reading";

describe("free concern presentation", () => {
  it("renders independent KO/EN fields and escapes the user's question as text", () => {
    for (const locale of ["ko", "en"] as const) {
      const reading = createFreeConcernReading({ locale, focusId: "work", concern: '<script>alert("PRIVATE")</script> 사업을 시작해도 될까요?' });
      const html = renderToStaticMarkup(createElement(FreeConcernReadingCard, { reading, locale }));
      expect(html).toContain("&lt;script&gt;"); expect(html).not.toContain("<script>");
      expect(html.match(/<dt>/g)).toHaveLength(3);
      expect(html).toContain(reading.action);
    }
  });
  it("offers region-labelled official crisis contacts without assigning location from language", () => {
    const reading = createFreeConcernReading({ locale: "en", focusId: "work", concern: "I want to kill myself" });
    const html = renderToStaticMarkup(createElement(FreeConcernReadingCard, { reading, locale: "en" }));
    expect(html).toContain('role="alert"'); expect(html).toContain('href="tel:109"'); expect(html).toContain('href="tel:988"');
    expect(html).toContain("KR"); expect(html).toContain("US"); expect(html).not.toContain("Read the chart");
  });
  it("does not assume a crime-related visitor is an offender or show unrelated hotlines", () => {
    const reading = createFreeConcernReading({ locale: "ko", focusId: "growth", concern: "범죄 피해로 도움이 필요해요" });
    const html = renderToStaticMarkup(createElement(FreeConcernReadingCard, { reading, locale: "ko" }));
    expect(html).not.toContain('href="tel:109"'); expect(html).not.toContain('href="tel:988"');
    expect(html).toContain("확인된 사실과 안전");
  });

});
