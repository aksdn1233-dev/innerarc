import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("independent numerology menu", () => {
  it("gives numerology a named route while preserving the historical profile route", async () => {
    const [home, numerologyPage, profilePage, documents, onboarding, sajuHub] = await Promise.all([
      readFile("src/components/home-experience.tsx", "utf8"),
      readFile("src/app/[locale]/numerology/page.tsx", "utf8"),
      readFile("src/app/[locale]/profile/page.tsx", "utf8"),
      readFile("src/core/site-documents.ts", "utf8"),
      readFile("src/components/onboarding-experience.tsx", "utf8"),
      readFile("src/components/saju-service-hub.tsx", "utf8"),
    ]);

    expect(home).toContain("/${locale}/numerology");
    expect(numerologyPage).toContain("routeName=\"numerology\"");
    expect(numerologyPage).toContain("OnboardingExperience");
    expect(profilePage).toContain("OnboardingExperience");
    expect(documents).toContain('"/numerology"');
    expect(onboarding).not.toContain("NumerologyGuideRoster");
    expect(sajuHub).toContain("NumerologyGuideRoster");
    expect(sajuHub).toContain('surface="saju"');
  });
});
