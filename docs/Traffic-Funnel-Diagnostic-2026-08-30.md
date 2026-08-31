# Traffic and funnel diagnostic — 2026-08-30

## Answer first

The Cloudflare value of 98–110 unique visitors must not be read as 98–110 people. Cloudflare's
zone metric is network-level uniqueness, and the same 24-hour window contains large volumes of
custom-host verification, vulnerability scanning, declared crawlers, release checks, and operator
browsing. After isolating Korean `/ko` entries by user agent, the defensible external-browser range
is **zero to one candidate**, not 110 confirmed people.

That one candidate loaded the Korean home page, its scripts, manifest, and hero media, then made no
observable request to a service route. It is therefore a possible home-page exit, but the sample is
too small and the client is not provably human. No product or pricing decision should be made from
this single observation.

## Evidence window and metric definitions

- Window: 2026-08-29 21:00 through 2026-08-30 21:00 Asia/Seoul.
- Cloudflare displayed 98 unique network visitors at the end of the window; the preceding hourly
  baseline showed 110. Neither metric is a human count.
- `sum.visits` is an external/direct visit-start heuristic. It can be emitted by scanners and
  crawlers and can exceed or differ from unique network visitors.
- Request counts include HTML, scripts, images, media, health checks, redirects, errors, bots, and
  vulnerability probes. They are not visits or people.

## Decomposition

| Signal | Observed evidence | Interpretation |
| --- | ---: | --- |
| `jscrawler` | 58 requests, 56 visit starts | automated crawler |
| Cloudflare custom-host verification | 79 requests | infrastructure check |
| `.env` and server-file probes | hundreds of 404-bound requests | vulnerability scanning |
| 404 responses | 361 adaptive requests | mostly non-product probing |
| Korean `/ko` visit starts | 16 | mixed internal and external traffic |
| Internal browser-equivalent Mac Chrome 151 | 7 Korean `/ko` starts | operator/Codex verification |
| curl + node + named release checks | 7 Korean `/ko` starts | automated operations |
| named automatic service review | 1 Korean `/ko` start | automated operations |
| remaining Windows Chrome 151 | 1 Korean `/ko` start | external-browser candidate; human not proven |

Country totals also show the automation bias: the adaptive dataset recorded 417 Korean requests,
250 Indian requests, 163 United States requests, and 62 German requests. Germany contributed 57
visit starts, closely matching the 56 `jscrawler` starts.

## Candidate journey

The remaining candidate requested `/ko` once and downloaded the page framework, manifest, and hero
media. There was no subsequent `/ko/fortune`, `/ko/numerology`, `/ko/reading`, or `/ko/plans`
request from that browser signature in the evidence window. The narrow finding is therefore:

1. Candidate reached the home page.
2. Candidate saw enough of the page to request its main media and scripts.
3. No service-route continuation was observed.

Possible causes include insufficient value clarity, a first-screen mismatch with the campaign
promise, curiosity-only traffic, or an automated browser. The evidence cannot distinguish among
these causes. Qualitative page changes are premature until multiple external candidates reproduce
the same step.

## Measurement correction implemented

- Added a first-party, aggregate-only `journey_view` event with a closed route allowlist and a
  closed source allowlist.
- UTM and referrer values are immediately reduced to categories such as SeenThis, Naver Blog,
  Naver Search, Google Search, Instagram, Disquiet, direct, or other. Raw URLs, queries, campaign
  text, IP addresses, names, birth details, questions, phone numbers, and report content are never
  stored.
- A route is counted at most once per browser tab session. No server-side session or visitor
  identifier is stored.
- localhost, administrator routes, declared bots/crawlers, curl/node/release-check agents, and
  explicitly marked internal operator browsers are excluded.
- The administrator console now shows route-entry and source-entry aggregates separately from
  Cloudflare network traffic, while retaining the warning that counts are not people.

## Decision and next threshold

Do not redesign the home journey from this one candidate. Collect at least 30 non-internal home
route entries per source and inspect the aggregate continuation to free pattern, Saju guide,
reading, plans, payment start, and payment success. Investigate when one step loses at least 40%
of entries with a denominator of at least 30, or immediately when payment or report delivery fails.

The change is additive and reversible. It adds no third-party analytics provider, no user profile,
no advertising identifier, and no pricing or payment-path change. Storage cost is limited to tiny
existing aggregate marker objects. Disable the journey component or analytics sink if route errors,
privacy concerns, meaningful performance impact, or false bot exclusions appear.

## Release evidence

- Production version: `1133d6db-4000-4136-be9d-1b4be1205219`.
- Rollback version: `76b0a10f-2fa3-4318-9893-975eb25d11bb`.
- Verification: 758 unit tests, TypeScript, lint with zero errors, Next production build, Vinext
  production artifact build, live health 200, live Korean home 200, release-agent exclusion 204,
  strict invalid-event rejection 400, both home actions visible, and zero browser console errors.
