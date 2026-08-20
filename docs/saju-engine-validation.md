# Saju engine validation

Status: **PARTIALLY VALIDATED — not release-approved for lunar input or paid Saju reports.**

## What is verified

- The deterministic engine, not an AI model, calculates year/month/day/hour pillars,
  heavenly stems, earthly branches, five phases, yin/yang, ten gods, hidden stems,
  broadly stable pairwise combinations/clashes, void branches, and the current luck-cycle
  policy.
- Every chart now carries `engineVersion`, `calculationPolicyVersion`,
  `interpretationRuleVersion`, `aiPromptVersion`, `modelVersion`, the full policy object,
  normalized inputs, canonical pillars/facts, warnings, and relationships.
- The 2024 equinox and solstice tests agree within ten minutes with the U.S. Naval
  Observatory values (03:06 UTC and 20:51 UTC). NASA's public SkyCal independently lists
  the March event at 03:07 UTC.
- The Korea Astronomy and Space Science Institute 2024 almanac lists 입춘 at
  2024-02-04 17:27 KST. The engine places it at about 17:20 KST, inside its declared
  15-minute uncertainty, and changes year/month pillars on opposite sides.
- KASI's 2023/2024 calendar tables confirm that lunar months may have 29 or 30 days and
  that 2023 contained a leap second month. Those cases exist in the fixture corpus as
  fail-closed validation gaps, not accepted conversions.

Primary validation references:

- KASI calendar/almanac: https://astro.kasi.re.kr/life/post/calendardata
- KASI 2024 almanac PDF: https://astro.kasi.re.kr/file/astro_almanac_pdf/20231023135218580.pdf
- U.S. Naval Observatory seasons: https://aa.usno.navy.mil/calculated/seasons?year=2024&tz=0&dst=false
- NASA GSFC SkyCal: https://eclipse.gsfc.nasa.gov/SKYCAL/SKYCAL.html?cal=2024

## Golden corpus

`tests/fixtures/saju-golden-fixtures.json` includes:

- ordinary known-time and unknown-time charts;
- pre/post-입춘 and within-boundary-uncertainty cases;
- late-Zi next-day versus same-day policy;
- invalid Gregorian date, old/future range rejection, and unsupported timezone;
- lunar day 29, lunar day 30, leap lunar month, and invalid Gregorian leap flag.

The last three lunar fixtures are expected rejections. This is intentional: accepting
them before a validated Korean lunar conversion table is integrated would invent a date.

## Property and regression checks

- A 60-day interval advances exactly one sexagenary day per civil day.
- Canonical chart evidence survives JSON serialization.
- Unknown time never creates an hour pillar.
- Both late-Zi policies are stored and differ by exactly one day pillar when applicable.
- Narrative validation rejects unknown fact IDs, duplicate paragraphs, fixed/high-stakes
  claims, and pillar labels absent from the canonical chart.

## Known disagreements and policy boundaries

- 야자시 versus 조자시 is an explicit stored policy, not a hidden default.
- 대운 direction and start-age rounding use the documented
  `year-stem-polarity-and-recorded-sex-v1` and
  `three-days-per-year-nearest-year-v1` policies. Alternative schools are not silently mixed.
- 형·파·해, 삼합 weighting, 신살, 용신/희신, twelve life stages, 세운, 월운, 일진,
  and 택일 are deferred until each rule set has its own version, evidence, and fixtures.
- The current true-solar-time longitude correction and historical Korea offset model may
  disagree with almanacs that use civil clock time only; the policy and correction remain
  visible so the difference can be explained.

## Release blockers

1. Integrate and independently validate a Korean solar/lunar converter, including every
   supported leap month and 29/30-day boundary.
2. Cross-check a statistically meaningful pillar corpus against at least two independent
   almanac implementations; public astronomical sources validate term instants, not every
   Saju convention.
3. Review pre-1908 and historical summer-time handling with a time-history specialist.
4. Add database integration tests for immutable recalculation, diff, invalidation, and RLS.
5. Complete Korean domain-expert review without attaching a living practitioner's brand or
   proprietary wording.
