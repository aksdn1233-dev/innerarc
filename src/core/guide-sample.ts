import { calculateNumerologyProfile } from "@/core/numerology";
import { getRuleBasedProfile } from "@/core/profile";
import { dictionaries } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

/** The one birth date every published example on the site is calculated from. */
export const GUIDE_SAMPLE_BIRTH_DATE = "1994-11-04";

export type GuideSampleResult = Readonly<{
  birthDate: string;
  serviceYear: number;
  numbers: readonly Readonly<{ label: string; value: string }>[];
  archetype: string;
  summary: string;
  strength: string;
  risk: string;
}>;

/**
 * The free result the walkthrough shows, calculated rather than written.
 *
 * The guide claims to be showing the actual screen, so the numbers on it have to be the
 * numbers the engine produces for that birth date. A hand-written example would drift
 * from the calculator the first time either changed, and the claim would quietly become
 * false. Same date as `/samples`, so the whole site's examples agree with each other.
 */
export function createGuideSampleResult(locale: Locale, serviceYear: number): GuideSampleResult {
  const d = dictionaries[locale];
  const profile = calculateNumerologyProfile({
    birthDate: GUIDE_SAMPLE_BIRTH_DATE,
    name: "",
    personalYear: serviceYear,
  });
  const reading = getRuleBasedProfile(profile.lifePath.value, locale);
  const master = (value: number) => value === 11 ? "11/2" : value === 22 ? "22/4" : value === 33 ? "33/6" : String(value);
  return {
    birthDate: GUIDE_SAMPLE_BIRTH_DATE,
    serviceYear,
    numbers: [
      { label: d.lifePath, value: master(profile.lifePath.value) },
      { label: d.birthday, value: master(profile.birthday.value) },
      { label: d.attitude, value: master(profile.attitude.value) },
      { label: d.personalYear, value: master(profile.personalYear.value) },
    ],
    archetype: reading.archetype,
    summary: reading.summary,
    strength: reading.strengths[0],
    risk: reading.risks[0],
  };
}
