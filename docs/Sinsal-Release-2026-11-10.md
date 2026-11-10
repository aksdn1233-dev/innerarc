# Four Pillars traditional markers — 2026-11-10

The owner requested 신살 in free, detailed and premium results. This adds four
versioned, deterministic comparison rules without changing the existing chart engine:

- 백호: day pillar only, one of 甲辰 乙未 丙戌 丁丑 戊辰 壬戌 癸丑.
- 홍염: compare day stem to the known year/month/day/hour branches: 甲乙→午,
  丙→寅, 丁→未, 戊己→辰, 庚→戌, 辛→酉, 壬→子, 癸→申.
- 도화 and 역마: use the day-branch 삼합 groups 申子辰, 寅午戌, 巳酉丑,
  亥卯未, respectively matching 도화 酉 卯 午 子 and 역마 寅 申 亥 巳.
  Do not silently combine year-branch and day-branch conventions.

These traditions have variants: the UI names its convention, matched locations and
unknown hour. No match in known pillars is not a claim about an unknown hour. Readings
are symbolic prompts, not predictions, diagnoses, certain personality or guaranteed
outcomes. References for variants and tables:
https://www.durumisaju.com/dict/sinsal/intro
https://www.dk-saju.com/sinsal/%EB%8F%84%ED%99%94%EC%82%B4
https://sajubam.site/ko/glossary/sinsal/yeokma
https://hamsaju.com/blog/hongyeom-sal

New reports store an optional `sinsal` field with version and localised text; existing
stored reports without it render as before and are not regenerated. The free chart and free pattern result,
KO/EN detailed and premium reader, Japanese reader and fixed sample, chart report, and
private download display the stored result. An unexpected calculation failure gives an
explicit unavailable message instead of preventing a paid report. No new API call,
provider cost, migration, data collection, analytics or shared account access is added.
Current prices, entitlements, authentication, callback verification, saved purchases,
consent, export/deletion and calculation engine remain unchanged.

Owner demand is explicit; existing product paths distribute the feature. 5,500/9,800/
36,000 KRW unit economics and fulfillment fees are unchanged. Monitor completion,
fulfillment failure and support/refund feedback; do not claim scientific validity or
prediction accuracy. Revert on wrong calculated results, paid fulfillment/access failure
or misleading content. Pre-change source is c0ff602f60a1893b8639bd80fb58f47209aa19d7;
Worker identity must be checked at deployment. Roll back code through CI and keep data,
security fixes, catalog prices and dashboard variables (`--keep-vars`).

Local verification: focused report quality 327/327; full unit 1,486/1,486 including
additional matching-table fixtures; lint zero errors with four existing navigation
warnings, typecheck, Next and Vinext builds passed. Ten installed-Chrome desktop/mobile
emulation checks covered free intake, free pattern and KO/JA report examples; no real customer records
or payment were used. First test run found that appending a normal section disrupted the
existing question-answer invariant; the optional field preserves section order. A later
full run caught a fixed particle and source-order assertion; copy was corrected and the
download preserves its original section/action order. Neither assertion was weakened.
The first two free-pattern browser attempts used a test origin of port 3000 while the
server ran on 3063; rerunning with the actual E2E_BASE_URL passed both environments.
Final CI, production release and any limitations belong in the PR release record.
