# Saju engine rules

Canonical implementation: `src/core/saju/`.

## Non-negotiable boundary

`birth data → deterministic calendar/Saju engine → canonical facts → versioned rules →
structured interpretation facts → optional AI phrasing → validator → result`

AI is never a calendar converter, pillar calculator, relationship detector, or source of
new Saju facts. Symbolic interpretations are for reflection and are not scientific
prediction, diagnosis, treatment, guaranteed outcomes, or professional advice.

## Current policy set

- Engine: `saju-core-1.1.0`
- Policy: `kr-standard-1.0.0`
- Timezone: historical Korea offsets, `Asia/Seoul` only
- Solar terms: Meeus low-accuracy apparent longitude; twelve month-opening terms
- Late Zi hour: explicit next-day (`야자시`) or same-day (`조자시`)
- Longitude: true-solar-time correction, Seoul default disclosed
- Luck direction: year-stem polarity plus recorded sex
- Luck start: distance to governing term, three days per year, nearest whole year
- Calendar conversion: Gregorian input only; lunar and leap-month input fail closed

## Stable implemented relationships

Five stem combinations, six branch combinations, and six branch clashes are emitted with
rule IDs. 형, 파, 해, 삼합, 공망 interpretation, 신살, 용신/희신, twelve life stages,
세운, 월운, 일진, and 택일 require separate versioned policies before implementation.

## Version and persistence rule

Never store rendered prose alone. Store normalized input, full policy, canonical result,
all five version identifiers, rule IDs, warnings, and creation time. Recalculation creates
a new immutable chart version, records a canonical diff, identifies affected
interpretations, and never overwrites history.

See `docs/saju-engine-validation.md` for evidence and release blockers.
