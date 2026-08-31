import { describe, expect, it } from "vitest";
import {
  classifyJourneyRoute,
  classifyJourneySource,
  isOperationalAutomationUserAgent,
} from "@/core/analytics/traffic-attribution";

describe("privacy-safe traffic attribution", () => {
  it("maps public paths to a small route allowlist", () => {
    expect(classifyJourneyRoute("/ko")).toBe("home");
    expect(classifyJourneyRoute("/ko/numerology")).toBe("numerology");
    expect(classifyJourneyRoute("/ko/samples/saju")).toBe("sample_saju");
    expect(classifyJourneyRoute("/ko/reports/order-secret")).toBe("report");
    expect(classifyJourneyRoute("/ko/not-allowlisted/private")).toBe("other");
  });

  it("stores only allowlisted source categories, never raw referrers or campaign text", () => {
    expect(classifyJourneySource({ utmSource: "seenthis" })).toBe("seenthis");
    expect(classifyJourneySource({ utmSource: "private-campaign-name" })).toBe("other_campaign");
    expect(classifyJourneySource({ referrer: "https://blog.naver.com/post/secret?q=private" })).toBe("naver_blog");
    expect(classifyJourneySource({ referrer: "https://unknown.example/private" })).toBe("other_referral");
    expect(classifyJourneySource({})).toBe("direct");
  });

  it("excludes declared crawlers and release checks without excluding ordinary browsers", () => {
    expect(isOperationalAutomationUserAgent("Mozilla/5.0 (compatible; jscrawler/0.1)")).toBe(true);
    expect(isOperationalAutomationUserAgent("curl/8.7.1")).toBe(true);
    expect(isOperationalAutomationUserAgent("Mozilla/5.0 GYEOL release verification")).toBe(true);
    expect(isOperationalAutomationUserAgent("Mozilla/5.0 Chrome/151.0.0.0 Safari/537.36")).toBe(false);
  });
});
