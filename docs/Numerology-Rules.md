# Numerology Rules

Rule ID: `pythagorean-1.0.0`  
Status: Implemented

## General reduction

Add the supplied values. If the total has more than one digit, repeatedly sum its decimal digits. Stop at 1–9 or master number 11, 22, or 33. Master numbers are preserved whenever a reduction step reaches them.

Example:

```text
1994-11-04
1 + 9 + 9 + 4 + 1 + 1 + 0 + 4 = 29 → 2 + 9 = 11
```

## Date numbers

- **Life Path:** every digit of the zero-padded ISO date `YYYY-MM-DD`, then general reduction.
- **Birthday:** numeric day, then general reduction.
- **Attitude:** numeric month + numeric day, then general reduction.
- **Personal Year:** numeric month + numeric day + each digit of the requested four-digit calendar year, then general reduction.

The engine accepts only real proleptic Gregorian dates in ISO format. Date calculation is independent of locale and time zone. The caller supplies the Personal Year calendar year after resolving the user’s time zone.

## Name numbers

The name engine applies Unicode NFKD normalization, removes combining marks, uppercases, and calculates A–Z only. Spaces, apostrophes, and hyphens are separators. Other characters are reported as ignored.

Pythagorean values repeat 1–9:

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|
| A J S | B K T | C L U | D M V | E N W | F O X | G P Y | H Q Z | I R |

- **Expression/Destiny:** all supported letters.
- **Soul Urge:** A, E, I, O, U. Y is a consonant in version 1.
- **Personality:** supported consonants.

Names are optional and limited to 200 Unicode code points. Accented Latin letters such as José normalize to JOSE. Korean, Japanese, or other non-Latin names are not silently romanized: the result is unavailable unless the user supplies a romanization. This avoids culturally arbitrary calculations.

## Versioning rules

Stored facts include rule version, initial total, expression, reduction steps, and final value. Any change to master handling, Y classification, transliteration, date formula, or letter values requires a new rule version and migration decision; historical snapshots remain reproducible.
