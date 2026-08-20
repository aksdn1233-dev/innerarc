/**
 * Explicit calculation choices for places where almanacs or Saju schools differ.
 *
 * A policy is data, not an ambient preference. Persisting it with every chart is what
 * makes a historical result reproducible after the default policy changes.
 */
export type SajuCalculationPolicy = {
  readonly version: string;
  readonly timezonePolicy: "korea-historical-offsets-v1";
  readonly solarTermPolicy: "meeus-apparent-longitude-major-terms-v1";
  readonly lateZiHourPolicy: "late-zi-next-day" | "late-zi-same-day";
  readonly genderRulePolicy: "year-stem-polarity-and-recorded-sex-v1";
  readonly fortuneCyclePolicy: "three-days-per-year-nearest-year-v1";
  readonly calendarConversionPolicy: "gregorian-only-v1";
  readonly longitudePolicy: "true-solar-time-seoul-default-v1";
};

export const SAJU_CALCULATION_POLICY_VERSION = "kr-standard-1.0.0";

export const DEFAULT_SAJU_POLICY: SajuCalculationPolicy = Object.freeze({
  version: SAJU_CALCULATION_POLICY_VERSION,
  timezonePolicy: "korea-historical-offsets-v1",
  solarTermPolicy: "meeus-apparent-longitude-major-terms-v1",
  lateZiHourPolicy: "late-zi-next-day",
  genderRulePolicy: "year-stem-polarity-and-recorded-sex-v1",
  fortuneCyclePolicy: "three-days-per-year-nearest-year-v1",
  calendarConversionPolicy: "gregorian-only-v1",
  longitudePolicy: "true-solar-time-seoul-default-v1",
});

export function resolveSajuPolicy(
  lateZiHourPolicy?: SajuCalculationPolicy["lateZiHourPolicy"],
): SajuCalculationPolicy {
  return lateZiHourPolicy
    ? Object.freeze({ ...DEFAULT_SAJU_POLICY, lateZiHourPolicy })
    : DEFAULT_SAJU_POLICY;
}
