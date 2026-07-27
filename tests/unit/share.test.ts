import { describe, expect, it } from "vitest";
import { calculateNumerologyProfile } from "@/core/numerology";
import { createRelationshipInsight } from "@/core/relationship";
import { createCompatibilityInsight } from "@/core/compatibility";
import { findCelebrityMatches } from "@/core/celebrity";
import {
  assertSharePayloadSafe,
  buildCelebrityMatchShare,
  buildCompatibilityShare,
  buildCoreProfileShare,
  buildRomanticPatternShare,
  renderShareCardSvg,
  UnsafeSharePayloadError,
  type ShareCardPayload,
} from "@/core/share";
import {
  isShareCancellation,
  SHARE_CARD_PNG_HEIGHT,
  SHARE_CARD_PNG_WIDTH,
} from "@/components/share-card-file";

const profileA = calculateNumerologyProfile({ birthDate: "1994-11-04", name: "Minji Kim", personalYear: 2026 });
const profileB = calculateNumerologyProfile({ birthDate: "1988-03-17", name: "Alex Lee", personalYear: 2026 });

describe("privacy-safe share payloads", () => {
  it("builds four allowlisted card kinds without exact birth dates", () => {
    const relationship = createRelationshipInsight(profileA, "en");
    const compatibility = createCompatibilityInsight({ personA: profileA, personB: profileB, relationshipType: "romance", locale: "en" });
    const celebrity = findCelebrityMatches({ profile: profileA, locale: "en", limit: 1 }).matches[0];
    const cards = [
      buildCoreProfileShare({ locale: "en", lifePath: profileA.lifePath.value, archetype: "Justice", summary: "A reflective summary", strengths: ["Discernment", "Balance", "Clear criteria"] }),
      buildRomanticPatternShare({ locale: "en", insight: relationship }),
      buildCompatibilityShare({ locale: "en", insight: compatibility }),
      buildCelebrityMatchShare({ locale: "en", match: celebrity }),
    ];
    expect(cards.map((card) => card.kind)).toEqual(["core_profile", "romantic_pattern", "compatibility", "celebrity_match"]);
    for (const card of cards) {
      expect(JSON.stringify(card)).not.toMatch(/1994-11-04|1988-03-17/);
      expect(card.highlights.length).toBeGreaterThan(0);
      expect(() => assertSharePayloadSafe(card)).not.toThrow();
    }
  });

  it("compatibility share has no field for either person's name", () => {
    const insight = createCompatibilityInsight({ personA: profileA, personB: profileB, relationshipType: "marriage", locale: "en" });
    const card = buildCompatibilityShare({ locale: "en", insight });
    expect(JSON.stringify(card)).not.toMatch(/Minji|Alex/);
    expect(Object.keys(card)).not.toContain("personName");
  });

  it("rejects exact dates, contacts, and prohibited certainty", () => {
    const safe = buildCoreProfileShare({ locale: "en", lifePath: 11, archetype: "Justice", summary: "Reflect on a choice", strengths: ["Balance"] });
    expect(() => assertSharePayloadSafe({ ...safe, subtitle: "Born 1994-11-04" })).toThrow(UnsafeSharePayloadError);
    expect(() => assertSharePayloadSafe({ ...safe, subtitle: "Email me@example.com" })).toThrow(UnsafeSharePayloadError);
    expect(() => assertSharePayloadSafe({ ...safe, subtitle: "You will definitely succeed" })).toThrow(UnsafeSharePayloadError);
  });

  it("clips oversized source copy into the bounded schema", () => {
    const card = buildCoreProfileShare({
      locale: "en",
      lifePath: 11,
      archetype: "Justice",
      summary: "x".repeat(1_000),
      strengths: ["y".repeat(1_000)],
    });
    expect(card.subtitle.length).toBeLessThanOrEqual(180);
    expect(card.highlights[0].length).toBeLessThanOrEqual(140);
  });

  it("keeps Korean and English on the same schema and card kind", () => {
    const ko = buildCoreProfileShare({ locale: "ko", lifePath: 11, archetype: "정의", summary: "선택 기준을 살펴봅니다.", strengths: ["균형", "분별"] });
    const en = buildCoreProfileShare({ locale: "en", lifePath: 11, archetype: "Justice", summary: "Reflect on decision criteria.", strengths: ["Balance", "Discernment"] });
    expect(ko.schemaVersion).toBe(en.schemaVersion);
    expect(ko.kind).toBe(en.kind);
    expect(Object.keys(ko)).toEqual(Object.keys(en));
  });
});

describe("self-contained share SVG", () => {
  it("escapes markup and never creates remote image or script nodes", () => {
    const base = buildCoreProfileShare({ locale: "en", lifePath: 11, archetype: "Justice", summary: "Reflect on a choice", strengths: ["Balance"] });
    const candidate = { ...base, title: "<script>alert('x')</script>" } as ShareCardPayload;
    const svg = renderShareCardSvg(candidate);
    expect(svg).toContain("&lt;script&gt;");
    expect(svg).not.toContain("<script>");
    expect(svg).not.toMatch(/<image|href=/);
    expect(svg).toContain('width="1080"');
    expect(svg).toContain('height="1350"');
  });

  it("keeps raster dimensions fixed and distinguishes cancellation from failure", () => {
    expect([SHARE_CARD_PNG_WIDTH, SHARE_CARD_PNG_HEIGHT]).toEqual([1080, 1350]);
    expect(isShareCancellation(new DOMException("cancelled", "AbortError"))).toBe(true);
    expect(isShareCancellation(new Error("failed"))).toBe(false);
    expect(isShareCancellation({ name: "AbortError" })).toBe(true);
    expect(isShareCancellation(null)).toBe(false);
  });
});
