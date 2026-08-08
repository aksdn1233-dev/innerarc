import type { Locale } from "@/i18n/config";

const INTERNAL_EXTENSION = /\[(?:프리미엄 확장|Premium extension)\s*·\s*[^\]]+\]\s*/gu;
const CROSS_LABELS: Record<string, readonly [string, string]> = {
  reinforcement: ["서로 보강되는 지점", "Mutually reinforcing point"],
  tension: ["서로 충돌하는 지점", "Point of tension"],
  moderation: ["균형을 잡아야 할 지점", "Point to balance"],
};

function hasBatchim(word: string): boolean {
  const last = word.codePointAt(word.length - 1) ?? 0;
  return last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0;
}

function naturalizeKoreanParticles(text: string): string {
  return text.replace(/([가-힣]+)(이\(가\)|을\(를\)|은\(는\))/gu, (_, word: string, particle: string) => {
    const pair = particle === "이(가)" ? ["이", "가"] : particle === "을(를)" ? ["을", "를"] : ["은", "는"];
    return `${word}${pair[hasBatchim(word) ? 0 : 1]}`;
  });
}

/** Removes authoring-only labels and fixes mechanical Korean particles at display time.
 * Applying this in the view also cleans reports that were generated before the fix. */
export function polishReportText(text: string, locale: Locale): string {
  const extensionLead = locale === "ko" ? "더 깊게 보면, " : "In greater depth, ";
  let polished = text.replace(INTERNAL_EXTENSION, extensionLead);
  polished = polished.replace(/\[(reinforcement|tension|moderation)\]\s*/gu, (_, label: string) => {
    const translated = CROSS_LABELS[label];
    return translated ? `${locale === "ko" ? translated[0] : translated[1]}: ` : "";
  });
  return locale === "ko" ? naturalizeKoreanParticles(polished) : polished;
}
