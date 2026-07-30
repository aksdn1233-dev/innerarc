import { describe, expect, it } from "vitest";
import { ConsentStateSchema, maskSensitiveLog } from "@/core/privacy";
import { dictionaries } from "@/i18n/dictionaries";
import { privacyCopy, termsCopy } from "@/i18n/legal-copy";

describe("privacy controls", () => {
  it("requires explicit independent consent fields", () => {
    const acceptedAt = new Date().toISOString();
    expect(
      ConsentStateSchema.parse({
        privacyRequired: true,
        aiPersonalization: false,
        modelTraining: false,
        productAnalytics: false,
        marketing: false,
        rawJournalRetention: false,
        acceptedAt,
        policyVersion: "1.0",
      }),
    ).toMatchObject({ aiPersonalization: false, marketing: false });

    expect(() =>
      ConsentStateSchema.parse({
        privacyRequired: false,
        aiPersonalization: true,
        modelTraining: true,
        productAnalytics: true,
        marketing: true,
        rawJournalRetention: true,
        acceptedAt,
        policyVersion: "1.0",
      }),
    ).toThrow();
  });

  it("masks email and birth-date patterns in logs", () => {
    expect(maskSensitiveLog("user@example.com born 1994-11-04")).toBe(
      "[REDACTED_EMAIL] born [REDACTED_DATE]",
    );
  });
});

describe("Korean and English content parity", () => {
  it("has non-empty, structurally equal dictionaries", () => {
    expect(Object.keys(dictionaries.ko).sort()).toEqual(Object.keys(dictionaries.en).sort());
    for (const dictionary of Object.values(dictionaries)) {
      expect(dictionary.nav).toHaveLength(5);
      expect(dictionary.interests).toHaveLength(6);
      expect(dictionary.depths).toHaveLength(3);
      expect(dictionary.disclaimer.length).toBeGreaterThan(40);
    }
  });

  it("avoids scientific prediction claims in both disclaimers", () => {
    expect(dictionaries.ko.disclaimer).toContain("미래 예측");
    expect(dictionaries.en.disclaimer).toContain("not scientific");
  });

  it("keeps privacy and terms section structures aligned across locales", () => {
    expect(privacyCopy.ko.sections).toHaveLength(privacyCopy.en.sections.length);
    expect(termsCopy.ko.sections).toHaveLength(termsCopy.en.sections.length);
    expect(privacyCopy.ko.status).toContain("법률 검토 필요");
    expect(privacyCopy.en.status).toContain("legal review pending");
    expect(termsCopy.ko.intro).toContain("유료 결제");
    expect(termsCopy.en.intro).toContain("Refund requests");
  });

  it("publishes the approved support contacts and refund response window", () => {
    const koreanLegalCopy = JSON.stringify([privacyCopy.ko, termsCopy.ko]);
    const englishLegalCopy = JSON.stringify([privacyCopy.en, termsCopy.en]);

    expect(koreanLegalCopy).toContain("010-8706-1938");
    expect(koreanLegalCopy).toContain("qkrehgus5886@naver.com");
    expect(koreanLegalCopy).toContain("이메일 접수일로부터 7일 이내");
    expect(englishLegalCopy).toContain("010-8706-1938");
    expect(englishLegalCopy).toContain("qkrehgus5886@naver.com");
    expect(englishLegalCopy).toContain("within seven days");
  });
});
