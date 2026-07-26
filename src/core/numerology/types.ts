export const MASTER_NUMBERS = [11, 22, 33] as const;

export type ReductionStep = {
  readonly input: number;
  readonly digits: readonly number[];
  readonly output: number;
  readonly masterPreserved: boolean;
};

export type NumberCalculation = {
  readonly value: number;
  readonly initialTotal: number;
  readonly steps: readonly ReductionStep[];
  readonly expression: string;
  readonly ruleVersion: string;
};

export type NameCalculation = {
  readonly status: "calculated" | "unavailable";
  readonly normalizedName: string;
  readonly ignoredCharacters: readonly string[];
  readonly reason?: "not_provided" | "no_supported_letters" | "too_long";
  readonly destiny?: NumberCalculation;
  readonly soulUrge?: NumberCalculation;
  readonly personality?: NumberCalculation;
};

export type NumerologyProfile = {
  readonly birthDate: string;
  readonly system: "pythagorean";
  readonly ruleVersion: string;
  readonly lifePath: NumberCalculation;
  readonly birthday: NumberCalculation;
  readonly attitude: NumberCalculation;
  readonly personalYear: NumberCalculation;
  readonly name: NameCalculation;
};

export class NumerologyInputError extends Error {
  constructor(
    public readonly code:
      | "INVALID_DATE_FORMAT"
      | "INVALID_CALENDAR_DATE"
      | "YEAR_OUT_OF_RANGE"
      | "INVALID_PERSONAL_YEAR",
    message: string,
  ) {
    super(message);
    this.name = "NumerologyInputError";
  }
}
