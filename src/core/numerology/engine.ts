import {
  MASTER_NUMBERS,
  NumerologyInputError,
  type NameCalculation,
  type NumberCalculation,
  type NumerologyProfile,
  type ReductionStep,
} from "./types";

export const NUMEROLOGY_RULE_VERSION = "pythagorean-1.0.0";

const MAX_NAME_LENGTH = 200;
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

const isMasterNumber = (value: number): boolean =>
  MASTER_NUMBERS.includes(value as (typeof MASTER_NUMBERS)[number]);

const digitsOf = (value: number): number[] =>
  Math.abs(value).toString().split("").map(Number);

const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

export function reduceNumber(initialTotal: number): Pick<NumberCalculation, "value" | "steps"> {
  if (!Number.isSafeInteger(initialTotal) || initialTotal < 0) {
    throw new TypeError("Reduction input must be a non-negative safe integer.");
  }

  const steps: ReductionStep[] = [];
  let current = initialTotal;
  while (current > 9 && !isMasterNumber(current)) {
    const digits = digitsOf(current);
    const next = sum(digits);
    steps.push({
      input: current,
      digits,
      output: next,
      masterPreserved: isMasterNumber(next),
    });
    current = next;
  }
  return { value: current, steps };
}

function calculation(values: readonly number[], labels?: readonly string[]): NumberCalculation {
  const initialTotal = sum(values);
  const reduced = reduceNumber(initialTotal);
  return {
    ...reduced,
    initialTotal,
    expression: (labels ?? values.map(String)).join(" + "),
    ruleVersion: NUMEROLOGY_RULE_VERSION,
  };
}

type ParsedDate = { year: number; month: number; day: number; digits: number[] };

export function parseBirthDate(input: string): ParsedDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!match) {
    throw new NumerologyInputError(
      "INVALID_DATE_FORMAT",
      "Birth date must use the ISO YYYY-MM-DD format.",
    );
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || year > 9999) {
    throw new NumerologyInputError("YEAR_OUT_OF_RANGE", "Birth year must be 0001–9999.");
  }
  const probe = new Date(0);
  probe.setUTCHours(0, 0, 0, 0);
  probe.setUTCFullYear(year, month - 1, day);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() + 1 !== month ||
    probe.getUTCDate() !== day
  ) {
    throw new NumerologyInputError("INVALID_CALENDAR_DATE", "Birth date is not a real date.");
  }
  return { year, month, day, digits: input.replaceAll("-", "").split("").map(Number) };
}

export function calculateLifePath(birthDate: string): NumberCalculation {
  return calculation(parseBirthDate(birthDate).digits);
}

export function calculateBirthdayNumber(birthDate: string): NumberCalculation {
  const { day } = parseBirthDate(birthDate);
  return calculation([day]);
}

export function calculateAttitudeNumber(birthDate: string): NumberCalculation {
  const { month, day } = parseBirthDate(birthDate);
  return calculation([month, day]);
}

export function calculateBirthYearNumber(birthDate: string): NumberCalculation {
  const { year } = parseBirthDate(birthDate);
  return calculation(String(year).padStart(4, "0").split("").map(Number));
}

export function calculatePersonalYear(birthDate: string, calendarYear: number): NumberCalculation {
  const { month, day } = parseBirthDate(birthDate);
  if (!Number.isInteger(calendarYear) || calendarYear < 1 || calendarYear > 9999) {
    throw new NumerologyInputError(
      "INVALID_PERSONAL_YEAR",
      "Personal year must be an integer from 1 to 9999.",
    );
  }
  const yearDigits = String(calendarYear).padStart(4, "0").split("").map(Number);
  return calculation([month, day, ...yearDigits]);
}

export function letterValue(letter: string): number {
  if (!/^[A-Z]$/.test(letter)) {
    throw new TypeError("Pythagorean letter values support A-Z only.");
  }
  return ((letter.charCodeAt(0) - 65) % 9) + 1;
}

export function calculateNameNumbers(name?: string | null): NameCalculation {
  if (name == null || name.trim() === "") {
    return {
      status: "unavailable",
      normalizedName: "",
      ignoredCharacters: [],
      reason: "not_provided",
    };
  }
  if ([...name].length > MAX_NAME_LENGTH) {
    return {
      status: "unavailable",
      normalizedName: "",
      ignoredCharacters: [],
      reason: "too_long",
    };
  }

  const letters: string[] = [];
  const ignored: string[] = [];
  for (const originalCharacter of [...name.normalize("NFC")]) {
    const normalizedCharacter = originalCharacter
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toUpperCase();
    const supported = [...normalizedCharacter].filter((char) => /^[A-Z]$/.test(char));
    if (supported.length > 0) {
      letters.push(...supported);
    } else if (!/[\s\-'’.]/u.test(originalCharacter)) {
      ignored.push(originalCharacter);
    }
  }
  const ignoredCharacters = [...new Set(ignored)];
  const normalizedName = letters.join("");
  if (letters.length === 0) {
    return {
      status: "unavailable",
      normalizedName,
      ignoredCharacters,
      reason: "no_supported_letters",
    };
  }

  const all = letters.map(letterValue);
  const vowels = letters.filter((letter) => VOWELS.has(letter)).map(letterValue);
  const consonants = letters.filter((letter) => !VOWELS.has(letter)).map(letterValue);
  return {
    status: "calculated",
    normalizedName,
    ignoredCharacters,
    destiny: calculation(all),
    soulUrge: calculation(vowels.length ? vowels : [0]),
    personality: calculation(consonants.length ? consonants : [0]),
  };
}

export function calculateNumerologyProfile(input: {
  birthDate: string;
  name?: string | null;
  personalYear: number;
}): NumerologyProfile {
  parseBirthDate(input.birthDate);
  return {
    birthDate: input.birthDate,
    system: "pythagorean",
    ruleVersion: NUMEROLOGY_RULE_VERSION,
    lifePath: calculateLifePath(input.birthDate),
    birthday: calculateBirthdayNumber(input.birthDate),
    attitude: calculateAttitudeNumber(input.birthDate),
    personalYear: calculatePersonalYear(input.birthDate, input.personalYear),
    name: calculateNameNumbers(input.name),
  };
}
