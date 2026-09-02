import { onboardingFocusIds, type OnboardingFocusId } from "@/core/onboarding";

/**
 * The concern chosen on one page, read back on the next.
 *
 * It travels as a `focus` query parameter so a visitor is not asked the same question
 * twice on the way from the home page to the free reading and on to the intake form. It
 * is one of a closed set of category names — never the sentence anyone wrote, a birth
 * date, or anything else personal — and an unrecognised value resolves to nothing, so a
 * hand-edited URL only loses the preselection.
 */
export function resolveConcernHandoff(value: string | string[] | undefined): OnboardingFocusId | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return undefined;
  return onboardingFocusIds.includes(candidate as OnboardingFocusId)
    ? candidate as OnboardingFocusId
    : undefined;
}
