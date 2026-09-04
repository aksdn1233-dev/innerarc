import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  ANALYTICS_SCHEMA_VERSION,
  SafeAnalyticsEventSchema,
} from "@/core/analytics";
import { calculateNumerologyProfile } from "@/core/numerology";
import { createIntegratedProfile } from "@/core/profile";
import { onboardingFocusIds } from "@/core/onboarding";
import { createPaidTeaser } from "@/core/paid-teaser";
import { buildReportOutline } from "@/core/report-outline";
import { getSampleReport, SAMPLE_REPORT_BIRTH_DATE } from "@/server/reports/sample-report";
import {
  OPERATIONAL_EVENT_NAMES,
  metricDimension,
  summarizeOperationalMetrics,
  type OperationalMetricRow,
} from "@/server/operational-metrics";

const base = {
  schemaVersion: ANALYTICS_SCHEMA_VERSION,
  eventId: "11111111-1111-4111-8111-111111111111",
  occurredAt: "2026-09-02T10:00:00.000Z",
  sessionId: "session_12345678",
  locale: "ko" as const,
};

const homeExperience = await readFile("src/components/home-experience.tsx", "utf8");
const onboardingExperience = await readFile("src/components/onboarding-experience.tsx", "utf8");
const shopExperience = await readFile("src/components/shop-experience.tsx", "utf8");
const globals = await readFile("src/app/globals.css", "utf8");

describe("home navigation reaches something", () => {
  /**
   * The regression this guards: the home page was reduced to its opening screen and
   * every section its header linked to moved to /reading, leaving six header links and
   * the one purchase action on the free result pointing at anchors that no longer
   * existed. Simplifying the page is allowed; leaving the navigation pointing at
   * nothing is not.
   */
  it("points no route at the removed home-page anchors", () => {
    for (const source of [homeExperience, onboardingExperience, shopExperience]) {
      expect(source).not.toMatch(/`\/\$\{locale\}#/);
    }
  });

  it("gives the home header only targets the home page renders or routes that exist", () => {
    const homeNav = /homeNav: \[(.+?)\],\n/s.exec(homeExperience)?.[1] ?? "";
    expect(homeNav).not.toBe("");
    const hrefs = [...homeNav.matchAll(/\["([^"]+)",/g)].map((match) => match[1]!);
    expect(hrefs.length).toBeGreaterThanOrEqual(4);
    for (const href of hrefs) {
      if (href.startsWith("#")) {
        // Rendered outside the showEverything branch, so the home page really has it.
        expect(homeExperience).toContain(`id="${href.slice(1)}"`);
      } else {
        expect(href).toMatch(/^\/reading(#|$)/);
      }
    }
  });

  it("keeps the free result's purchase action on a page that has the intake form", () => {
    expect(onboardingExperience).toMatch(/href=\{`\/\$\{locale\}\/reading\?focus=\$\{paidTeaser\.focusId\}#onboarding`\}/);
  });
});

describe("concern-specific paid teaser", () => {
  it("covers every concern the free reading can be centred on", () => {
    for (const focusId of onboardingFocusIds) {
      for (const locale of ["ko", "en"] as const) {
        const teaser = createPaidTeaser(focusId, locale);
        expect(teaser.focusId).toBe(focusId);
        expect(teaser.bridge.length).toBeGreaterThan(10);
        expect(teaser.cta.length).toBeGreaterThan(5);
        expect(teaser.lockedTopics.length).toBeGreaterThanOrEqual(4);
        expect(new Set(teaser.lockedTopics).size).toBe(teaser.lockedTopics.length);
      }
    }
  });

  it("names what is covered without promising an outcome", () => {
    for (const focusId of onboardingFocusIds) {
      const ko = createPaidTeaser(focusId, "ko");
      const en = createPaidTeaser(focusId, "en");
      const korean = [ko.bridge, ko.cta, ...ko.lockedTopics].join(" ");
      const english = [en.bridge, en.cta, ...en.lockedTopics].join(" ");
      expect(korean).not.toMatch(/보장|반드시|확실|적중|맞춰드립|예언/);
      expect(korean).not.toMatch(/치료|진단|투자\s*수익|합격|당첨/);
      expect(english).not.toMatch(/guarantee|certain|predict|cure|diagnos/i);
    }
  });

  it("gives each concern its own wording rather than one generic block", () => {
    const ctas = onboardingFocusIds.map((focusId) => createPaidTeaser(focusId, "ko").cta);
    expect(new Set(ctas).size).toBe(ctas.length);
  });
});

describe("report preview shows the report that is actually delivered", () => {
  it("lists chapter titles taken from the production generator", () => {
    const report = getSampleReport("detail", "ko");
    const outline = buildReportOutline(report, { openCount: 2, maxEntries: 6 });
    expect(outline.entries).toHaveLength(6);
    expect(outline.totalSections).toBe(report.sections.length);
    expect(outline.remaining).toBe(report.sections.length - 6);
    outline.entries.forEach((entry, index) => {
      expect(entry.title).toBe(report.sections[index]!.title);
      expect(entry.position).toBe(index + 1);
    });
  });

  it("opens only the first chapters and locks the rest", () => {
    const outline = buildReportOutline(getSampleReport("detail", "ko"), { openCount: 2, maxEntries: 6 });
    expect(outline.entries.filter((entry) => !entry.locked)).toHaveLength(2);
    for (const entry of outline.entries) {
      expect(Boolean(entry.excerpt)).toBe(!entry.locked);
    }
  });

  it("ends an excerpt on a sentence rather than mid-word", () => {
    const outline = buildReportOutline(getSampleReport("detail", "ko"), {
      openCount: 2,
      maxEntries: 4,
      excerptLength: 110,
    });
    for (const entry of outline.entries.filter((item) => item.excerpt)) {
      const excerpt = entry.excerpt!;
      expect(excerpt.length).toBeLessThanOrEqual(112);
      expect(excerpt).not.toMatch(/\.…$/);
      expect(excerpt).toMatch(/[.…]$/);
    }
  });

  it("returns the same outline for the same locale so the preview cannot drift", () => {
    const first = buildReportOutline(getSampleReport("detail", "en"), { openCount: 1, maxEntries: 5 });
    const second = buildReportOutline(getSampleReport("detail", "en"), { openCount: 1, maxEntries: 5 });
    expect(second).toEqual(first);
  });
});

describe("the funnel between the free result and checkout is measurable", () => {
  const steps = [
    "landing_view",
    "concern_selected",
    "free_start",
    "birth_input_complete",
    "free_result_view",
    "paid_teaser_view",
    "paid_teaser_click",
    "product_view",
    "product_select",
    "payment_start",
    "payment_success",
    "report_view",
  ] as const;

  it("accepts every step of the funnel", () => {
    for (const name of steps) {
      expect(OPERATIONAL_EVENT_NAMES).toContain(name);
    }
  });

  it("validates the new events and rejects anything personal on them", () => {
    expect(SafeAnalyticsEventSchema.safeParse({
      ...base,
      name: "concern_selected",
      properties: { concern: "money", surface: "home" },
    }).success).toBe(true);
    expect(SafeAnalyticsEventSchema.safeParse({
      ...base,
      name: "free_result_view",
      properties: { concern: "relationships" },
    }).success).toBe(true);
    expect(SafeAnalyticsEventSchema.safeParse({
      ...base,
      name: "report_view",
      properties: { productCode: "pro_30d" },
    }).success).toBe(true);

    // A birth date, a name, or the written question must never ride along.
    expect(SafeAnalyticsEventSchema.safeParse({
      ...base,
      name: "free_result_view",
      properties: { concern: "money", birthDate: "1994-11-04" },
    }).success).toBe(false);
    expect(SafeAnalyticsEventSchema.safeParse({
      ...base,
      name: "concern_selected",
      properties: { concern: "직장을 옮겨야 할까요", surface: "home" },
    }).success).toBe(false);
    expect(SafeAnalyticsEventSchema.safeParse({
      ...base,
      name: "paid_teaser_click",
      properties: { concern: "money", question: "언제 그만둬야 하나요" },
    }).success).toBe(false);
  });

  it("aggregates a step loss per concern without identifying anyone", () => {
    const rows: OperationalMetricRow[] = [
      { metric_date: "2026-09-02", locale: "ko", event_name: "free_result_view", dimension: "concern:money", count: 12 },
      { metric_date: "2026-09-02", locale: "ko", event_name: "free_result_view", dimension: "concern:relationships", count: 20 },
      { metric_date: "2026-09-02", locale: "ko", event_name: "paid_teaser_view", dimension: "concern:money", count: 9 },
      { metric_date: "2026-09-02", locale: "ko", event_name: "paid_teaser_click", dimension: "concern:money", count: 2 },
      { metric_date: "2026-09-02", locale: "ko", event_name: "report_view", dimension: "productCode:pro_30d", count: 1 },
    ];
    const metrics = summarizeOperationalMetrics(rows, ["2026-09-02"]);
    expect(metrics.freeResultViews).toBe(32);
    expect(metrics.paidTeaserViews).toBe(9);
    expect(metrics.paidTeaserClicks).toBe(2);
    expect(metrics.reportViews).toBe(1);
    expect(metrics.concernViews).toEqual([
      { key: "relationships", count: 20 },
      { key: "money", count: 12 },
    ]);
  });

  it("stores a concern category as its dimension and never free text", () => {
    expect(metricDimension({ concern: "money", surface: "home" })).toBe("concern:money");
    expect(metricDimension({ surface: "numerology" })).toBe("surface:numerology");
    expect(metricDimension({ concern: "이직할까요" })).toBe("all");
  });
});

describe("the free reading shows less than the engine calculates", () => {
  /**
   * The free result had grown into most of the paid one: eight domains, three career
   * directions, every strength. Trimming what is rendered must not trim what is
   * computed — the paid report reads the same engine and has to keep all of it.
   */
  it("still calculates every domain and career direction", () => {
    const profile = calculateNumerologyProfile({
      birthDate: "1994-11-04",
      name: "",
      personalYear: 2026,
    });
    const integrated = createIntegratedProfile(profile, "ko");
    expect(integrated.domains).toHaveLength(8);
    expect(integrated.careerRecommendations).toHaveLength(3);
  });

  it("renders only the opening slice of each and names the remainder", () => {
    expect(onboardingExperience).toContain("const FREE_DOMAIN_COUNT = 3;");
    expect(onboardingExperience).toContain("const FREE_CAREER_COUNT = 1;");
    expect(onboardingExperience).toContain("const FREE_STRENGTH_COUNT = 2;");
    expect(onboardingExperience).toContain("integratedProfile.domains.slice(0, FREE_DOMAIN_COUNT)");
    expect(onboardingExperience).toContain("integratedProfile.careerRecommendations.slice(0, FREE_CAREER_COUNT)");
    // Withheld sections are named, so the page never quietly drops content.
    expect(onboardingExperience).toContain("free-tier-remainder");
  });
});

describe("a free reading is readable on the ground it is painted on", () => {
  /**
   * .webtoon-flow paints a night ground; .webtoon-adapt deliberately leaves its blocks
   * unpainted, so they keep the light theme's ink. Together those two facts put near-black
   * body text on a near-black page: the free result's own "탐색할 강점" measured 2.35:1 and
   * its bullets 2.14:1, against the 4.5 those sizes need. The ground under the bands is
   * paper for exactly that reason.
   */
  it("gives the adapted bands a paper ground under the night flow", () => {
    const rule = /\.webtoon-flow > \.webtoon-adapt,\s*\.webtoon-flow\.webtoon-adapt \{[^}]*\}/.exec(globals)?.[0] ?? "";
    expect(rule).toContain("background: var(--paper)");
  });

  it("keeps the small label tones above AA on every paper the site paints", () => {
    const channel = (value: number) => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
      return 0.2126 * channel(r!) + 0.7152 * channel(g!) + 0.0722 * channel(b!);
    };
    const contrast = (a: string, b: string) =>
      (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
    const token = (name: string) =>
      new RegExp(`--${name}: (#[0-9a-f]{6});`).exec(globals)?.[1] ?? "";

    const grounds = ["paper", "paper-deep", "white"].map(token);
    expect(grounds.every(Boolean)).toBe(true);
    for (const ink of ["muted", "clay"].map(token)) {
      expect(ink).not.toBe("");
      for (const ground of grounds) expect(contrast(ink, ground)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("the walkthrough plays recordings of the running product", () => {
  /**
   * The stage claims to be showing the real screen, so what plays on it is a recording
   * of the real screen, made by a committed script rather than drawn. These keep the
   * files, the script, and what the component asks for in agreement.
   */
  const screens = ["questions", "intake", "free-result", "report"] as const;

  it("ships a clip and a poster for every step", async () => {
    for (const name of screens) {
      const clip = await readFile(`public/images/guide/${name}.mp4`);
      const poster = await readFile(`public/images/guide/${name}.jpg`);
      expect(clip.byteLength).toBeGreaterThan(20_000);
      // Only the step being watched downloads, but keep each one modest anyway.
      expect(clip.byteLength).toBeLessThan(1_600_000);
      expect(poster.byteLength).toBeGreaterThan(5_000);
      // H.264 in an MP4 container, so it plays on iOS Safari.
      expect(clip.subarray(4, 8).toString("latin1")).toBe("ftyp");
      expect(clip.subarray(0, 4_096).toString("latin1")).toContain("avc1");
    }
  });

  it("asks for exactly those clips, in order", () => {
    const declared = /const GUIDE_SCREENS = \[([\s\S]*?)\] as const;/.exec(homeExperience)?.[1] ?? "";
    expect([...declared.matchAll(/"([a-z-]+)"/g)].map(([, name]) => name)).toEqual([...screens]);
    expect(homeExperience).toContain('`/images/guide/${screen}.jpg`');
    expect(homeExperience).toContain('src={`/images/guide/${screen}.mp4`}');
  });

  it("keeps the recording script committed, on the published sample birth date", async () => {
    const script = await readFile("scripts/capture-guide-screens.mjs", "utf8");
    expect(script).toContain(SAMPLE_REPORT_BIRTH_DATE);
    expect(script).toContain("/ko/samples/detail");
    expect(script).toContain("libx264");
  });

  it("holds nothing but the picture inside the frame", () => {
    const source = homeExperience.slice(
      homeExperience.indexOf('<div className="guide-stage" ref={guideStageRef}>'),
    );
    const stage = source.slice(0, source.indexOf("</div>"));
    expect(stage).not.toBe("");
    expect(stage).not.toMatch(/<input|<select|<textarea|<button|<Link|<p |<h2|<h3/);
  });

  it("downloads the step being watched and the one it moves to next, once the stage is reached", () => {
    expect(homeExperience).toContain('preload={stageReady && isNear(index) ? "auto" : "none"}');
    expect(homeExperience).toContain("index === (guideStep + 1) % GUIDE_SCREENS.length");
    // A poster is fetched whatever `preload` says, so it waits for the stage too.
    expect(homeExperience).toContain("poster={stageReady ?");
  });

  it("moves to the next step when the clip ends, and shows how far through it is", () => {
    // The reference advances by itself. `loop` would hold a step forever, so its absence
    // is the thing that makes the walk a walk.
    expect(homeExperience).toContain("setGuideStep((step) => (step + 1) % GUIDE_SCREENS.length)");
    // Scoped to the stage: the hero portrait upstairs is a loop on purpose.
    const clip = homeExperience.slice(
      homeExperience.indexOf('className="guide-stage-clip"'),
      homeExperience.indexOf('type="video/mp4"'),
    );
    expect(clip).not.toMatch(/^\s+loop$/m);
    expect(homeExperience).toContain('guideTabsRef.current?.style.setProperty("--guide-progress"');
    expect(globals).toContain("transform: scaleX(var(--guide-progress, 0));");
    // Nothing steps through screens nobody is looking at.
    expect(homeExperience).toContain("setStageOnScreen(entry.isIntersecting)");
    expect(homeExperience).toContain("!stageOnScreen");
  });

  it("leaves a visitor who asked for less motion the poster instead", () => {
    expect(homeExperience).toContain('window.matchMedia("(prefers-reduced-motion: reduce)").matches');
    expect(homeExperience).toContain("if (index !== guideStep || !stageReady || !stageOnScreen || still) {");
  });
});
