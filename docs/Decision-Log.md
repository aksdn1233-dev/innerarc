# Decision Log

## D-078 — Keep technical provider labels out of the customer experience

- Date: 2026-08-25
- Decision: Remove the literal `AI`/`인공지능` label from every displayable application string,
  report sentence, metadata description, image alternative, sitemap caption, and crawler refusal
  body. Describe the same facts in plain language: `외부 맞춤 처리`, `정해진 계산 규칙`, and
  `자동 생성 콘셉트`. Keep internal provider names, consent field identifiers, safety modules,
  tests, and crawler tokens unchanged. Strengthen the home `무료 패턴 보기` action with a fully
  opaque gold surface, dark text, and an isolated foreground label.
- Demand evidence and distribution: The owner reported that the free-pattern label washed into the
  moving background and explicitly required the technical label to disappear across every customer
  function. Routes, prices, search destinations, and acquisition channels do not change.
- Unit economics and cost: Reading prices and payment behavior are unchanged. The copy and CSS change
  adds no provider, storage, generation, payment, or fulfillment cost.
- Safety, consent, and truthfulness: The product does not hide external processing or generated-image
  provenance. Required notices now say that data may go to an external personalization provider and
  that shop imagery is automatically generated and not a delivery-item photograph. Separate consent,
  model-training choice, deterministic fact boundaries, and disabled-provider behavior remain intact.
- Success and guardrails: A source-string regression test rejects the prohibited customer label; the
  home test requires the exact free-pattern label, dedicated class, foreground span, opaque gradient,
  and no text shadow. Preserve readable 4.5:1 text contrast, keyboard focus, social/search metadata,
  report detail, and product-image truthfulness.
- Reversal conditions: Revert the CSS if the gold button loses contrast or hierarchy. Revert wording
  only if legal review requires a specific provider term, and replace it with a plainly explained,
  separately consented notice rather than silently removing disclosure. Pre-change production rollback
  reference: v74 at `5aa009668bc3c732ffcdcfd46f590d4fc7222250`.
- Status: Owner-authorized; implemented with a regression test after the first scan found and removed
  one remaining Korean method sentence.

## D-077 — Refuse declared AI crawlers at robots and edge layers

- Date: 2026-08-25
- Decision: Keep conventional Googlebot and Naver Yeti discovery for public marketing pages,
  but disallow published AI training, answer-engine, user-fetch, dataset, and generic extraction
  agents in `robots.txt`. Refuse those same identifiable user agents with HTTP 403 at the Worker
  before application routing, static assets, or image optimization. Allow `/robots.txt` itself so
  compliant crawlers can read the refusal. Remove the prior `FacebookBot` refusal because normal
  social-link previews are part of the existing user-initiated sharing feature.
- Demand evidence and distribution: The product owner explicitly requested that AI crawlers not
  collect the site. The deliberate cost is exclusion from ChatGPT, Claude, Perplexity, and similar
  answer-engine discovery; ordinary Naver and Google Search distribution remains in scope.
- Unit economics and cost: Reading prices and the 1,500 KRW campaign clock do not change. The edge
  check uses no paid provider and adds one bounded substring scan per request. Monitor Worker request
  volume because a refused request still reaches the deployed Worker unless a separately managed WAF
  blocks it earlier.
- Security boundary: `robots.txt` is advisory and HTTP user agents can be omitted or spoofed. This
  control reliably signals compliant operators and denies declared agents, but cannot guarantee that
  a hostile scraper impersonating a normal browser will be identified. Purchased reports, accounts,
  orders, payments, and administrator routes continue to require their existing authorization and
  carry response-level `noindex` controls.
- Success and guardrails: Every listed agent is present in the generated refusal file and receives
  403 for HTML, API, and image paths; `/robots.txt`, Googlebot, Yeti, browsers, and social previews
  remain reachable. Review operator tokens quarterly and after a crawler-policy change.
- Reversal conditions: Revert the edge match while preserving private-route authorization if a false
  positive blocks customers, payment callbacks, conventional search, or link sharing. Pre-change
  production rollback reference: v73 at `efd788b6d0f2949ea02300c1a401ff513a67672b`.
- Status: Owner-authorized; implemented and regression-tested locally.

## D-076 — Make the home promise concrete and preserve CTA hierarchy

- Date: 2026-08-22
- Decision: Replace the abstract home hook with a concrete reflection promise about repeated
  choices in relationships, work, and money. On desktop, keep the primary action on its own row
  and place the two secondary actions below it so Korean labels do not wrap into uneven buttons.
- Evidence and scope: The checked-in desktop capture showed three competing actions compressed at
  the bottom of the cinematic hero. The change affects copy and responsive layout only; character
  art, calculations, prices, consent, checkout, analytics, and safety claims stay unchanged.
- Success and guardrails: Evaluate the existing consent-gated primary/secondary CTA events by
  viewport, and require no clipped or wrapped labels at the desktop breakpoint. Revert if the new
  promise is read as a guaranteed prediction or if the primary action loses visual priority.
- Status: Implemented and locally regression-tested; a post-change browser capture remains pending.

## D-068 — Replace report-card stacks with actual character webtoon scenes

- Date: 2026-08-21
- Decision: Render every purchased Numerology chapter, Saju chapter, fixed product sample,
  and compatibility result as a full illustrated scene selected deterministically from the
  owner-supplied character manifest. Each scene combines a background, effect layer,
  character acting cut, separate narration, and accessible HTML speech bubble. Keep order,
  calculation evidence, report text, safety copy, downloads, feedback, and entitlements
  unchanged. Utility forms and post-report controls remain ordinary interface elements.
- Demand evidence and distribution: The product owner reviewed all four deployed 1994-11-04
  results and explicitly rejected the card-like presentation as not being a webtoon. The
  change applies to the same protected paid-report, sample, Saju, and compatibility routes;
  no new acquisition channel is added.
- Unit economics: Prices remain 5,500 / 39,000 / 79,000 KRW. Existing first-party PNG assets
  create no AI, licensing, storage, payment, messaging, or fulfillment provider cost. Image
  bytes and mobile completion are the relevant operating costs.
- Safety and accessibility: Dialogue stays in selectable HTML rather than being baked into
  art. Decorative layers have empty alternative text, heading order and result text remain
  available to assistive technology, reduced-motion preferences are respected, and symbolic
  limits remain in the report.
- Success and guardrails: A result must visibly include character art, scene backgrounds,
  narration, and speech bubbles in its first episode beat; 390px and desktop layouts must not
  overflow horizontally; every chapter remains readable; calculation and payment regression
  suites stay green. Monitor result completion and image-load performance under existing
  consented analytics without collecting birth dates.
- Reversal conditions: Return to the prior presentation commit if character assets fail,
  dialogue becomes unreadable, mobile completion drops materially, accessibility regresses,
  or image bytes break the current performance budget. Reversion affects presentation only.
- Status: Owner-authorized correction after direct visual review.

## D-067 — Simplify compatibility choices and separate Numerology from Saju

- Date: 2026-08-21
- Decision: Show exactly five new compatibility choices — 애인, 직장 동료, 가족, 친구,
  동업 — while retaining the former detailed relationship identifiers for historical drafts
  and stored-report parsing. Add a family-specific operating overlay. Remove the automatic
  Saju cross-reading paragraph from every Numerology paid report; Saju reports continue to
  use only the deterministic versioned Saju engine and Numerology reports only the
  deterministic Numerology engine. Unknown Saju birth time hides corrected-clock output and
  leaves the hour pillar empty. Add fixed 1994-11-04 report-sample screens that create no
  order, payment, or storage and are excluded from search indexing.
- Demand evidence and distribution: The product owner directly requested the five contexts,
  repeated the system-separation requirement, and asked to inspect every result screen using
  1994-11-04. Distribution stays on the existing compatibility and reading routes plus
  unlisted sample URLs; the main and free-pattern screens remain unchanged.
- Unit economics: Product prices remain 5,500 / 39,000 / 79,000 KRW. The change adds no AI,
  payment, messaging, storage, or fulfillment provider cost. The fixed samples can reduce
  purchase uncertainty without exposing another person's data.
- Safety and claims: Compatibility remains a symbolic reflection with no percentage, destiny,
  loyalty, or stay/leave verdict. Family copy prioritizes consent, safety, observable behavior,
  and fair responsibility. Numerology/Saju provenance is no longer blended.
- Success and guardrails: Track compatibility form completion and product-page-to-checkout
  movement only under existing analytics consent. Guardrails are five visible choices in both
  languages, eight sections per result, no cross-system text in Numerology output, no corrected
  time when time is unknown, and no payment or persistence from sample screens.
- Reversal conditions: Revert the new public selector if completion falls materially or users
  cannot identify their relationship; preserve the family type and legacy parser. Remove the
  sample routes if they confuse visitors or materially reduce paid conversion. Never restore
  cross-system content without a separately named opt-in product and explicit owner approval.
- Status: Owner-authorized implementation.

## D-064 — Convert the free Saju chart into a 5,500 KRW one-time product

- Date: 2026-08-21
- Decision: The Four Pillars chart is no longer shown before payment. Its birth input creates a `SAJU_5500` checkout draft using the existing historically compatible `plus_30d` database code, while `readingKind=saju_chart` separates new Saju orders from retired Core reports. A verified payment opens the auditable chart report, file download, print/PDF, and a user-initiated email handoff containing the protected report URL.
- Demand evidence: The product owner explicitly requested the free-to-paid conversion and the 5,500 KRW price. External paid-demand evidence is not yet available.
- Unit economics: Gross revenue is 5,500 KRW per order. PayApp/payment-method fees, VAT, refunds, support time, and any future transactional-email provider cost must be measured before paid acquisition. No recurring access or automatic renewal is created.
- Safety and privacy: The chart keeps deterministic rule evidence, unknown-time disclosure, and non-prediction boundaries. The email action opens the buyer's own mail client; the application does not collect a delivery email or send the protected report URL to a new provider.
- Success metrics: first 20 verified purchases, payment completion, report-ready delivery above 99%, support/refund rate below 10%, and zero cross-user or access-token disclosure incidents.
- Reversal conditions: pause the product if a verified payment cannot produce the chart, calculation parity fails, refund/support burden exceeds the guardrail, or a privacy/access incident occurs. Reversal removes new checkout entry while preserving historical paid access.
- Status: Owner-authorized implementation; external demand, provider-fee, editorial, and real-payment evidence pending.

## D-047 — Clock-owned summer event pricing

- Date: 2026-08-01
- Decision: Label 9,600/39,000 KRW as the summer event through 2026-08-03 23:59:59 Asia/Seoul, then restore 39,000/79,000 KRW automatically from one server-owned schedule.
- Alternatives: Manual environment edit; permanent reduction; client-only countdown.
- Reason: A deterministic deadline avoids a missed manual rollback and keeps display, order, and provider charge aligned. A non-blocking banner communicates the event without obstructing the product.
- Impact: Dynamic home/plans pricing, crossed-out normal prices during the event, and a 409 price-refresh response when a stale browser tab crosses the boundary.
- Revisit when: A future campaign requires a database-managed calendar or multiple regions.
- Status: Decided.

## D-065 - Use the owner-supplied character package as an additive webtoon layer

- Date: 2026-08-21
- Decision: Install the 192 independent PNG character cuts plus 16 shared backgrounds
  and 16 props/effects under `public/assets/gyeol-webtoon`, connect the supplied manifest
  to a versioned deterministic scene selector, and render dialogue as accessible HTML over
  the existing numerology result. Keep calculation, payment, account, and entitlement code
  unchanged. Use redesigned Yundo and Hoyeon only.
- Demand evidence: The product owner directly supplied the production package and requested
  its integration after reviewing the live card layout. Distribution remains the existing
  web-first `/numerology` and `/fortune` routes; no new provider or fulfillment cost is added.
- Alternatives: Keep the prior six poster images; bake dialogue into images; let the UI pick
  scenes randomly; rewrite the numerology engine around characters.
- Reason: Supplied independent cuts provide the requested character-led experience while a
  pure selector and HTML dialogue preserve deterministic evidence, accessibility, translation,
  and graceful text-only fallback.
- Success and guardrails: Character panels render after a completed reading, 1994-11-04
  remains 11/4/6, all manifest paths exist, 320/360/375/390/430 px stay overflow-free, and
  symbolic-boundary copy remains visible. Monitor result completion and detailed-reading
  entry without collecting birth dates or dialogue; stop if completion falls materially or
  image bytes harm the current performance budget.
- Reversal condition: Revert the presentation layer to commit `86d9630` if assets are found
  malformed, character identity is mixed, mobile overflow returns, text fallback fails, or
  calculation/payment regressions appear. The calculation engine needs no rollback.
- Status: Decided and implemented; individual anatomical art review remains an editorial gate.

## D-066 — Add an optional device-local Daily Flow

- Date: 2026-08-21
- Decision: Open the previously unavailable `/daily-fortune` menu as a free bilingual
  reflection. It calculates one stable result per device-local calendar date from birth
  month/day only. Viewing once writes nothing; the separate “daily updates” action stores
  only month, day, version, and enable time in browser storage. Opening the page on a later
  local date derives the new result without a background job, notification, or provider.
- Demand evidence and distribution: The product owner directly requested an optional daily
  fortune update. Existing public competitor evidence verifies a daily return surface, but
  not demand for notifications. Distribution is limited to the existing `/fortune` service
  hub; the deliberately minimal home page is unchanged.
- Unit economics: The feature is free and deterministic with no AI, messaging, email,
  database, payment, or fulfillment provider cost. It does not change the 9,600/39,000 KRW
  report economics or create a subscription promise.
- Safety and privacy: Copy is framed as symbolic reflection with a practical action,
  caution, reality question, calculation evidence, and explicit no-prediction/no-professional-
  advice boundary. No birth year, name, question, account, analytics identifier, push token,
  or server record is collected. The preference is covered by device inspect/export/delete.
- Success and guardrails: Measure aggregate route opens and return-day opens only after
  analytics consent and without month/day. Target repeated voluntary use without reducing
  numerology completion; guardrails are zero external requests, zero silent storage, stable
  same-day output, bilingual parity, mobile accessibility, and no unsupported claims.
- Reversal conditions: Return the Today card to unavailable if the date boundary is wrong,
  local deletion/export misses the preference, users reasonably interpret it as prediction,
  or it materially harms performance or the primary service flow.
- Status: Decided and implemented; push/email/SMS reminders remain held pending separate
  demand, consent, provider, cost, quiet-hours, unsubscribe, and legal review.

## D-048 — Referral foundation remains inactive

- Date: 2026-08-01
- Decision: Prepare 25%-per-verified-friend logic, a draft 50% cap, keyed phone hashing, and restricted database schema, but expose no UI/API and apply no production migration.
- Alternatives: Immediate launch; unlimited 25% stacking; store raw referrer contact; generated public aliases only.
- Reason: “One friend = 25%” is easy to explain, but payment qualification, refund abuse, privacy, and stacking rules must be settled before money is affected. A generated alias is safer than publishing a phone number.
- Impact: The feature can be activated later without redesigning checkout; current customers and prices are unchanged.
- Revisit when: The owner approves the cap, refund qualification window, campaign stacking, and public code format.
- Status: Decided for foundation; launch held.

## D-001 — New Next.js foundation

- Date: 2026-07-18
- Decision: Use Next.js 16, React 19, strict TypeScript, mobile-first responsive App Router.
- Alternatives: Vite SPA; Expo-first; separate API service.
- Reason: One deployable full-stack boundary, mature server/client separation, future PWA and API routes, lower MVP overhead.
- Impact: React Native remains a later shared-domain expansion, not shared UI.
- Revisit when: Native store capabilities become critical or server scale requires service separation.
- Status: Decided.

## D-002 — Guest-first, browser-memory preview

- Date: 2026-07-18
- Decision: First analysis works without account; current Phase 1 stores no guest input.
- Alternatives: Mandatory signup; localStorage persistence.
- Reason: Proves value before friction and minimizes sensitive-data retention.
- Impact: Refresh clears the preview; saving waits for authenticated persistence.
- Revisit when: Account/database adapter is configured.
- Status: Decided.

## D-003 — Pythagorean rule version 1

- Date: 2026-07-18
- Decision: Sum all ISO date digits; preserve 11/22/33; A–Z mapping; A/E/I/O/U vowels; Y consonant; no automatic non-Latin romanization.
- Alternatives: Component reduction; Y context rules; automatic transliteration; Chaldean.
- Reason: Auditable, reproducible, culturally safer than invented transliteration, and matches the required example.
- Impact: Korean/Japanese names require optional user-supplied romanization for name numbers.
- Revisit when: Expert editorial review and locale-specific transliteration research justify a new version.
- Status: Decided.

## D-004 — AI cannot author calculated facts

- Date: 2026-07-18
- Decision: AI output references canonical fact IDs; unknown calculation references fail validation.
- Alternatives: Prompt-only instructions; free-form response.
- Reason: Prevents silent calculation drift and makes regressions auditable.
- Impact: Provider adapters must emit structured JSON.
- Revisit when: Never; only validation implementation may evolve.
- Status: Decided.

## D-005 — Working name InnerArc

- Date: 2026-07-18
- Decision: Use InnerArc as a development codename.
- Alternatives: No visible name; numerology-led names.
- Reason: Expresses personal development without cheap fortune-telling or generic AI imagery.
- Impact: UI and documentation need rebranding if unavailable.
- Revisit when: Trademark/domain/app-store search is authorized.
- Status: Provisional.

## D-006 — Consent separation

- Date: 2026-07-18
- Decision: Required privacy acknowledgement is separate from AI personalization, model training, marketing, and raw journal retention.
- Alternatives: Bundled blanket consent.
- Reason: Data minimization, clearer user control, and jurisdiction-ready design.
- Impact: Features must work with optional consents off where technically possible.
- Revisit when: Legal review requires more granular controls.
- Status: Decided.

## D-007 — TypeScript compatibility pin

- Date: 2026-07-19
- Decision: Pin TypeScript 6.0.3 instead of 7.0.2.
- Alternatives: Keep TypeScript 7 and override peer ranges; downgrade Next.js; remove Next.js ESLint TypeScript rules.
- Reason: Next.js 16.2.10 resolves typescript-eslint 8.64.0, whose supported TypeScript range ends below 6.1. A supported compiler/linter combination is required for deterministic CI.
- Impact: TypeScript 7 features are unavailable until the Next.js lint toolchain officially supports them.
- Revisit when: The installed Next.js/typescript-eslint release declares TypeScript 7 support and the full clean-install verification passes.
- Status: Decided.

## D-008 — pnpm package manager

- Date: 2026-07-19
- Decision: Standardize local and CI installs on pnpm 11.9.0 with a committed pnpm lockfile.
- Alternatives: Continue npm 11; maintain both npm and pnpm locks.
- Reason: Four npm install/clean-install variants repeatedly stalled for 10–15 minutes while materializing dependencies and left partial packages. pnpm completed the same dependency graph by using its content-addressed store.
- Impact: Contributors use `pnpm install --frozen-lockfile`; CI caches pnpm. A single lockfile prevents dependency drift.
- Revisit when: A supported package-manager migration is proposed with clean-install evidence on Windows and Linux.
- Status: Decided.

## D-009 — Auditable tarot replay seed

- Date: 2026-07-19
- Decision: Shuffle the canonical 78-card deck with a versioned seeded PRNG and Fisher–Yates; generate the ordinary seed from the platform cryptographic random source and retain it with the reading audit.
- Alternatives: AI selection; unrecorded `Math.random`; server-only opaque draw ID; seed commitment without replay material.
- Reason: AI selection would be deceptive, `Math.random` is not an auditable random source, and an explicit seed gives exact regression and dispute replay.
- Impact: Anyone with a stored seed can reproduce card order; the seed is audit data, not a secret. Persistence must return the original draw for a repeated idempotency key.
- Revisit when: A cryptographic commitment/reveal protocol is required for public or adversarial draws.
- Status: Decided.

## D-010 — Relationship likelihood is exposure guidance, not prediction

- Date: 2026-07-22
- Decision: Represent “where I am more likely to meet someone” as ranked meeting-context hypotheses with concrete exposure actions, not numeric odds. Represent “future spouse” as complementary qualities and relationship conditions to examine.
- Alternatives: Probability percentages; a predicted place/date; a generated spouse biography or appearance; omit the requested feature.
- Reason: There is no empirical probability model in the product, while practical context suggestions can still help users create authentic opportunities and reflect on preferences.
- Impact: UI must show uncertainty, reciprocal-consent/behavior checks, and the facts used. Internal relevance weights are not displayed as real-world probabilities.
- Revisit when: A separately validated, consented empirical recommendation model exists and legal/ethical review approves its claims.
- Status: Decided.

## D-011 — Reality Check retention is explicit and relevance is not accuracy

- Date: 2026-07-22
- Decision: Keep guest Reality Check records in session memory by default. Allow versioned browser-device persistence only after an explicit choice, with immediate export and deletion. Summaries use personal relevance groupings rather than prediction-accuracy scores.
- Alternatives: Always persist in localStorage; require account creation; keep session-only with no cross-session prototype; publish an accuracy percentage.
- Reason: Outcome follow-up benefits from persistence, but questions, decisions, and results are sensitive and shared-device storage is not equivalent to secure account storage. Relevance language matches the product's non-scientific positioning.
- Impact: The browser adapter must validate stored data, handle corruption, prevent duplicate retries, and disclose shared-device risk. Production reminders and durable reports still require authenticated server persistence.
- Revisit when: Encrypted authenticated persistence, retention controls, and legal review are available.
- Status: Decided.

## D-012 — Complete offline profile before paid AI connection

- Date: 2026-07-22
- Decision: Provide all eight profile domains and explanatory career role ranking through a deterministic bilingual fallback before connecting a paid model. AI remains an optional contextual expansion behind the canonical schema and fact guard.
- Alternatives: Show only a thin fallback; block deep results until an AI provider is selected; let AI create role scores and calculated facts.
- Reason: Guest users need useful first value during provider failure or declined consent, and deterministic output enables parity, safety, and cost-free regression testing.
- Impact: Domain and career ranking rule versions are stored separately from numerology rules. The UI labels outputs as symbolic hypotheses and includes observable reality checks.
- Revisit when: A provider passes bilingual quality, safety, latency, and cost gates; the deterministic fallback remains mandatory.
- Status: Decided.

## D-013 — Manual tarot provenance is immutable

- Date: 2026-07-22
- Decision: Persist tarot history as canonical card-ID/orientation snapshots with immutable `engine` or `manual` provenance. Engine readings require their replay seed; manual readings must not carry one.
- Alternatives: Store rendered text only; restore manual cards as an app draw; generate a synthetic seed for every history item.
- Reason: Users must be able to verify whether the app drew cards or merely recorded their physical draw. Canonical snapshots also prevent stale or fabricated card content from loading silently.
- Impact: Version-incompatible, duplicate-card, missing-seed, and fake-seed snapshots fail closed. Device storage remains explicit and separate from Reality Check storage.
- Revisit when: Snapshot migration tooling supports a new canonical deck or spread version without weakening provenance.
- Status: Decided.

## D-014 — Compatibility explains relationship operations, not fate

- Date: 2026-07-22
- Decision: Compare two canonical profiles through eight relationship-operating domains and relationship-type overlays. Do not produce a compatibility percentage, destined outcome, loyalty judgment, or stay/leave instruction.
- Alternatives: Single numeric score; free-form AI verdict; omit asymmetric power relationships; persist both profiles by default.
- Reason: Users need actionable language about communication, responsibility, authority, and repair, while a score would imply empirical validity the product does not have.
- Impact: Symmetric observations are invariant when people are swapped. Manager/report and parent/child flows state role order and prevent symbolism from legitimizing unequal consent or misplaced responsibility. Guest input is not stored.
- Revisit when: A separately validated relationship model and legal/ethical review support additional claims; symbolic compatibility remains non-predictive.
- Status: Decided.

## D-015 — Celebrity comparison is source-bound and date-structure-only

- Date: 2026-07-22
- Decision: Compare only Life Path, Birthday, and Attitude structures calculated from publicly sourced birth dates. Store the source URL, access date, and confidence with every record; show uncertainty and never infer private traits or identity percentages.
- Alternatives: Free-form celebrity biographies; AI-selected lookalikes; unsourced scraped dates; “83% same personality” scoring.
- Reason: Public-date structure can be audited, while personality identity and unsourced biographical inference would overstate what the symbolic model supports and increase defamation/privacy risk.
- Impact: The initial dataset is intentionally small and editorially source-bound. Results link directly to authoritative sources and disclose that structural similarity does not imply the same personality or life outcome.
- Revisit when: A licensed dataset and source-refresh workflow pass editorial, legal, and provenance review.
- Status: Decided.

## D-016 — Share cards use an allowlisted local renderer

- Date: 2026-07-22
- Decision: Build each share-card purpose through a typed allowlist and render a self-contained SVG in the browser. Reject exact dates, email addresses, phone-like strings, prohibited certainty claims, and unsafe markup; do not accept names, questions, journals, or raw profile objects.
- Alternatives: Screenshot the result page; upload data to an image service; use one generic object serializer; include birth dates for personalization.
- Reason: Purpose limitation and data minimization are stronger than post-hoc redaction. Local rendering avoids a new third-party disclosure and produces an auditable, portable artifact.
- Impact: The first version supports core profile, romantic pattern, compatibility, and celebrity match cards. It deliberately contains no tracking image, remote font, external asset, or hidden metadata.
- Revisit when: Server-side branded rendering is required and a privacy-reviewed upload, retention, and deletion design exists.
- Status: Decided.

## D-017 - Sensitive offline caching and HTTPS enforcement are explicit

- Date: 2026-07-22
- Decision: Ship a standards-based web-app manifest and installable metadata, but no service worker yet. Enable HSTS and `upgrade-insecure-requests` only when `APP_HTTPS_ONLY=true` in a real HTTPS environment.
- Alternatives: Cache the full application and user flows offline immediately; force HTTPS-upgrade CSP in every environment; omit PWA metadata.
- Reason: Guest questions and outcome records can be sensitive, and an unreviewed offline cache broadens retention. Unconditional request upgrading also breaks local HTTP production-bundle verification in WebKit.
- Impact: The application remains installable in supported browsers but does not promise offline access. Deployment configuration must explicitly enable HTTPS-only behavior after TLS is confirmed.
- Revisit when: Offline storage, purge, update, shared-device, and breach behavior pass privacy and security review.
- Status: Decided.

## D-018 - Paid providers remain behind consented, metered contracts

- Date: 2026-07-22
- Decision: Implement provider-neutral AI, analytics, payment, entitlement, and personalization contracts before selecting vendors. Analytics default to no-op, AI context is owner-scoped and consent-gated, and billing failure preserves Free access.
- Alternatives: Bind the MVP directly to one vendor; send raw text to analytics; optimistically grant paid state before confirmed provider events.
- Reason: Contracts allow safety, privacy, cost, idempotency, and failure behavior to be verified locally without external accounts or irreversible vendor commitments.
- Impact: The local MVP is complete at the adapter boundary; production capabilities remain unavailable until services pass privacy, quality, cost, and staging gates.
- Revisit when: Providers are selected and contract tests are run against staging adapters.
- Status: Decided.

## D-019 - Security-patched dependency graph uses temporary overrides

- Date: 2026-07-24
- Decision: Keep Next.js and `eslint-config-next` at 16.2.11, override `next>sharp` to 0.35.3, and move `next>postcss` from 8.5.10 to patched 8.5.19 after GHSA-6g55-p6wh-862q disclosed arbitrary local-file reading through attacker-controlled CSS source-map comments.
- Alternatives: Accept known high-severity advisories; wait for a later Next.js bundle; replace the framework immediately.
- Reason: PostCSS 8.5.12 is the first patched release; the existing 8.5.19 package is compatible with both Next.js and the test toolchain and collapses the graph to one safe version. The updated graph passes production build and audit with zero known vulnerabilities.
- Impact: `pnpm-workspace.yaml` owns two temporary transitive pins. Each framework upgrade must test whether they can be removed without reintroducing advisories or regressions.
- Revisit when: A newer Next.js graph resolves fixed compatible Sharp and PostCSS versions without overrides.
- Status: Decided.

## D-020 - Guest data rights are available before account connection

- Date: 2026-07-22
- Decision: Expose a bilingual `Me` privacy center before external identity is connected. It stores preferences only after an explicit save, validates IANA time zones, keeps optional consents independent, exports only validated local records, and deletes all InnerArc device keys in one confirmed action.
- Alternatives: Hide data controls until sign-in exists; rely on per-feature deletion only; persist guest preferences automatically.
- Reason: Guest users already control optional tarot and Reality Check storage, so aggregate inspection, portability, and deletion should not depend on creating an account.
- Impact: The navigation's `Me` tab is functional in the provider-neutral MVP. The page clearly distinguishes device-only data from future server/account data and does not imply that external providers are active.
- Revisit when: Authenticated persistence is connected; device and server scopes must remain separately visible and independently actionable.
- Status: Decided.

## D-021 - Crisis resources are explicit regional options, not locale inference

- Date: 2026-07-23
- Decision: Maintain a versioned registry of official crisis resources and show each option with its applicable region and source. Korean or English UI selection never determines the user's physical location.
- Alternatives: Infer Korea from Korean copy and the United States from English; show one global-looking number; omit source and verification metadata.
- Reason: Language is an unreliable location signal and an incorrect crisis contact can delay urgent help. Region labels and official sources preserve user agency and auditability.
- Impact: The current baseline includes Korea 109 and US/territories 988, generic immediate local-emergency guidance, a verification date, and a scheduled source-refresh protocol. The registry must expand only through reviewed official sources.
- Revisit when: Production location settings, additional launch regions, or qualified crisis-safety review require a broader explicitly selected registry.
- Status: Decided.

## D-022 - Pre-release legal pages expose unresolved launch fields

- Date: 2026-07-23
- Decision: Publish bilingual pre-release privacy information and terms inside the local product while clearly labelling them as pending legal review and listing unresolved controller, contact, jurisdiction, age, retention, vendor, and rights-response fields.
- Alternatives: Hide legal pages until every provider is selected; present draft text as final; put all unresolved items only in an internal document.
- Reason: Users need an honest description of the current local data boundary, and reviewers need missing launch decisions to remain visible rather than being filled with guesses.
- Impact: Consent surfaces link directly to the disclosures. No draft is represented as launch-ready, and qualified approval remains a release blocker tracked in the legal review packet.
- Revisit when: The operating entity, launch regions, providers, retention schedule, age policy, and rights channels are approved.
- Status: Decided.

## D-023 - Release evidence is reproducible and synthetic by default

- Date: 2026-07-23
- Decision: Generate a CycloneDX 1.6 production SBOM from the frozen pnpm lockfile and capture store screenshots through a deterministic browser script using synthetic inputs only. Validate the SBOM graph, reject screenshot external origins, and verify PNG dimensions from file headers.
- Alternatives: Manually list dependencies; capture ad hoc personal sessions; trust configured screenshot dimensions without reading the output file; defer evidence until deployment.
- Reason: Reproducible evidence reduces privacy leakage and release drift, while machine checks catch malformed supply-chain artifacts and misleading store assets before human review.
- Impact: CI archives the SBOM; current output contains 97 production components. Fifteen Korean/English 1242x2688 draft screenshots and a manifest are generated locally and remain subject to legal, brand, native-language, and platform approval.
- Revisit when: Store specifications, branding, dependency tooling, or distribution targets change.
- Status: Decided.

## D-024 - OpenAI is a disabled-by-default candidate adapter

- Date: 2026-07-24
- Decision: Implement a server-only candidate adapter against the official Responses API contract using strict Structured Outputs, `store: false`, minimized canonical facts, explicit cost configuration, metering, refusal/incomplete handling, abort propagation, fixed endpoint/no redirects, and fail-closed startup validation. Keep `AI_PROVIDER=disabled` as the default.
- Alternatives: No provider implementation; install a provider SDK immediately; expose a browser key; enable an unpinned model in production.
- Reason: A local adapter proves the privacy, safety, cost, schema, and failure boundary without external credentials. Direct HTTPS avoids adding a new supply-chain dependency after the SDK installation could not complete reliably in this environment.
- Impact: Production requires a date-pinned model alias, server-only secret, reviewed rates, staging quality/cost tests, provider terms/DPA review, and explicit authorization. No client bundle contains the endpoint or secret names.
- Revisit when: An approved provider account is available or an SDK materially improves contract safety and passes dependency review.
- Status: Decided.

## D-025 - Website and PWA precede native apps

- Date: 2026-07-24
- Decision: Treat the responsive Next.js website and installable PWA as the canonical first product. Do not begin a native iOS/Android client until web activation, Reality Check return behavior, accessibility, safety, data deletion, and unit economics meet approved targets.
- Alternatives: Build web and native in parallel; package a native shell immediately; prioritize app-store distribution before web proof.
- Reason: Web-first delivery shortens feedback cycles, avoids duplicating calculation and safety rules, and matches the user’s explicit priority.
- Impact: Architecture and documents distinguish web release readiness from later native packaging. Future clients must reuse the same versioned domain contracts.
- Revisit when: Web cohort evidence and distribution economics justify native-specific capability.
- Status: Decided.

## D-026 - Lifestyle recommendations are claim-free experiments

- Date: 2026-07-24
- Decision: Add deterministic accessory and music directions from canonical numerology facts. Accessory output covers form, palette, material, practical use, and safety; music output covers genre direction, sonic traits, use context, and a reality check. Neither uses purchase/listening history or makes luck, healing, therapy, prediction, or performance claims.
- Alternatives: AI-selected products and songs; gemstone efficacy; streaming-account ingestion; omit the requested feature.
- Reason: Style and sound can make an abstract result experiential at low data cost, but only if personal taste and observable fit outrank symbolism.
- Impact: Recommendations have bilingual stable IDs and evidence references. They remain secondary experiments subject to comprehension and usefulness testing.
- Revisit when: User evidence supports deeper personalization or an approved streaming/catalog integration.
- Status: Decided.

## D-027 - The shop is a closed category preview

- Date: 2026-07-24
- Decision: Create a bilingual shop route and category architecture with a clear `coming later` state, but no products, prices, stock, cart, checkout, affiliate links, or purchase claims.
- Alternatives: Open a placeholder checkout; hide commerce planning entirely; list unreviewed third-party products.
- Reason: The user requested future in-product purchasing, while suppliers, materials, consumer law, inventory, fulfillment, returns, payments, and demand are not approved.
- Impact: Category links carry no personal facts. Organic symbolic ranking is kept separate from any future sponsorship or commercial placement.
- Revisit when: Supplier, product-safety, legal, tax/refund, fulfillment, payment, accessibility, privacy, and demand gates pass.
- Status: Decided.

## D-028 - Commerce readiness cannot open the shop

- Date: 2026-07-26
- Decision: Add a pure future-catalog contract and twelve evidence-backed commerce gates. Product records require supplier, material/allergy, dimensions, care, origin, accessible media, price, inventory, return, and disclosure fields; reject symbolic outcome claims and tracking-bearing public links. Keep sponsored candidates outside the organic recommendation collection. A successful assessment can return only `ready_for_authorized_deployment`, never render purchase controls or deploy.
- Alternatives: Add products directly to the closed preview; let payment readiness imply launch; mix sponsored products into relevance ranking; defer all safeguards until a supplier is selected.
- Reason: The requested future store needs useful preparation now without creating a misleading open shop, a commercial bias in personal results, or an accidental external side effect.
- Impact: Thirteen deterministic tests now cover disclosure, claim, sponsorship, ordering, duplicate, evidence, authorization, approved-product, and kill-switch boundaries. Products, checkout, fulfillment, and live commerce remain absent.
- Revisit when: Qualified product, supplier, legal, privacy, tax, fulfillment, payment, accessibility, support, and demand evidence exists and the owner explicitly requests opening.
- Status: Decided.

## D-029 - Outcome reviews form a separate next-analysis layer

- Date: 2026-07-26
- Decision: Allow a relationship result to read already saved `relationship` Reality Checks only after an explicit user action. Derive a versioned context with a two-review minimum and a two-thirds threshold for repeatedly relevant or repeatedly not relevant signals. Keep mixed results uncertain, bound up to three recent unique learning notes, label them untrusted user data, and exclude raw questions, states, interpretations, choices, actions, outcomes, birth dates, and names.
- Alternatives: Automatically read all browser history on page load; alter numerology or meeting-context rankings; count only positive feedback; send saved text directly to an AI provider; wait for authenticated storage before connecting any feedback.
- Reason: The product promise requires later analysis to reflect lived outcomes, but doing so must preserve misses, user control, calculation integrity, and the local privacy boundary.
- Impact: The romantic result now has an auditable `outcome_review` layer with relevant/uncertain/not-relevant counts and explicit guidance. No provider transfer occurs, and zero or one review produces no personalization.
- Revisit when: Authenticated cross-device history and an approved AI provider exist; provider use still requires separate AI-personalization consent and the existing untrusted-context envelope.
- Status: Decided.

## D-030 - Relationship contexts cross into Reality Check as one-time drafts

- Date: 2026-07-26
- Decision: Let the user explicitly continue one displayed relationship-environment hypothesis into an editable Reality Check draft. Use a strict versioned `sessionStorage` item in the current tab, expire it after at most 30 minutes, consume it once, and navigate with a clean locale-only URL. Permit only generated reflection text, locale, public context ID, rule version, and audit timestamps.
- Alternatives: Put the result in URL parameters; copy the complete profile; save a Reality Check automatically; persist the draft in local storage; require manual retyping.
- Reason: A direct action closes the gap between symbolic reflection and observable behavior while explicit selection, field minimization, expiry, and edit-before-save preserve user agency and privacy.
- Impact: Birth date, name, number values, partner identity, third-party data, contact data, and exact location are structurally absent. Invalid, expired, wrong-locale, future-inconsistent, overlong, or extra-field payloads fail closed; unavailable session storage leaves the user on the relationship page without a fallback.
- Revisit when: Authenticated cross-device drafts are proposed; they require a new consent, retention, deletion, and owner-authorization review rather than extending this guest transport.
- Status: Decided.

## D-031 - Onboarding context remains separate from canonical calculations

- Date: 2026-07-26
- Decision: Use stable focus and depth IDs plus optional bounded concern text to create a versioned local context layer after the deterministic first result. Treat concern text as untrusted, page-memory-only input; do not place it in calculation evidence, storage, URLs, share cards, analytics, logs, or provider requests. An AI-personalization checkbox reports consent intent but cannot imply a provider request while the provider is disconnected.
- Alternatives: Ignore the collected onboarding choices; alter numerology output from the concern; persist the concern by default; send it to the candidate AI adapter; use localized display strings as data identifiers.
- Reason: The first result should respond to what the user asked without weakening calculation integrity or collecting sensitive concern text beyond what is necessary for the current page.
- Impact: Five focus IDs, three depth IDs, bounded Unicode normalization, contextual guidance, and deterministic next actions have Korean/English structural parity. Deep mode opens the existing eight-domain profile. The context layer has no network, persistence, analytics, sharing, or calculation side effect.
- Revisit when: An approved provider and authenticated storage exist; any provider or persistence use still requires explicit purpose, consent, minimization, retention, deletion, and staging evidence.
- Status: Decided.

## D-032 - Monthly outcome reports use the recorded local calendar month

- Date: 2026-07-26
- Decision: Record a `YYYY-MM` browser-local month when a new outcome review is saved, retain the UTC timestamp for audit/order, and group monthly reports by the recorded local month. Let the user select the current or any reviewed month without writing state. Keep old records readable by using their UTC timestamp month as a disclosed compatibility fallback.
- Alternatives: Continue grouping only by UTC; recompute every historical month from the device's current time zone; store a full time-zone/location value; silently migrate old records; show only the current month.
- Reason: A review completed shortly after local midnight can belong to a different UTC month, and users need to revisit prior monthly reports. Capturing only the month needed at the event preserves calendar meaning with less data than storing location or time zone.
- Impact: New reviews gain one bounded derived field, old version-1 records remain valid, the report exposes a legacy-fallback count, and month selection has no persistence, analytics, network, or URL side effect. The original interpretation and audit timestamp remain immutable.
- Revisit when: Authenticated cross-device reports exist and an approved server time-zone policy can be tested against travel, user preference changes, imports, and deletion.
- Status: Decided.

## D-033 - Relationship share UI loads after the initial route

- Date: 2026-07-26
- Decision: Load the relationship share-card panel through React `lazy` and `Suspense` after a relationship result exists, while keeping the allowlisted share payload and local SVG renderer unchanged.
- Alternatives: Raise the 1.05 MB decoded-JavaScript budget; remove sharing; rewrite the renderer; accept the 285-byte regression.
- Reason: The panel is not needed for the initial relationship route, and release budgets must remain fixed. Deferring it restores the budget without changing calculations, privacy filtering, external-request behavior, or the user's share action.
- Impact: All seven performance routes pass the unchanged budget. Relationship share preview remains functional and excludes the entered name and birth date in Chromium and mobile WebKit.
- Revisit when: Share usage evidence justifies a different interaction or a smaller common share runtime.
- Status: Decided.

## D-034 - Tarot presentation uses a restrained reflective reading-room metaphor

- Date: 2026-07-26
- Decision: Give the home and question flow a clearer tarot presence through first-party card-back geometry, portrait-format drawn-card faces, tactile paper/ink contrast, and progressive disclosure. Keep the product positioned as premium self-reflection: no neon mysticism, crystal-ball imagery, fear, certainty, or theatrical prediction language.
- Alternatives: Keep the current generic wellness-card treatment; imitate a traditional fortune shop; add externally sourced Rider-Waite artwork; redesign every product route before receiving more specific direction.
- Reason: The current interface is calm and readable but the card experience is too abstract to feel like a tarot reading. A bounded visual layer can make the ritual legible without changing calculations, safety, privacy, or the user’s decision authority.
- Impact: Decorative artwork is derived only from canonical card metadata and CSS. Card names, positions, orientations, keywords, and audit facts stay accessible text. The initial relationship share feature is deferred from the route bundle to recover the existing 285-byte decoded-JavaScript budget overage.
- Revisit when: Brand testing, licensed original card art, or specific owner art direction is available.
- Status: Decided.

## D-035 - Development dependency advisories block release evidence

- Date: 2026-07-27
- Decision: Resolve all `brace-expansion` paths to patched 5.0.8 for GHSA-mh99-v99m-4gvg, add a narrow import-compatibility patch for the legacy `minimatch` 3 consumer, and run the full `pnpm audit` in CI.
- Alternatives: Ignore the alert because it is development-only; keep the vulnerable legacy branch; force the incompatible package without a consumer patch; upgrade the complete lint stack in an unrelated major-version change.
- Reason: A crafted brace pattern can exhaust Node memory, and launch evidence must include the development/CI supply chain. The first global override cleared the advisory but broke ESLint because `minimatch` 3 expected a callable CommonJS export, so compatibility must be proven rather than assumed.
- Impact: The lockfile contains one `brace-expansion` version, 5.0.8. Full audit, ESLint, TypeScript, and 251 tests pass; the patch changes only how `minimatch` 3 obtains the same expansion function.
- Revisit when: The lint dependency graph no longer contains `minimatch` 3 or natively supports `brace-expansion` 5, at which point remove the compatibility patch and re-run the full gate.
- Status: Decided.

## D-036 - CI actions use current Node 24 runtimes

- Date: 2026-07-27
- Decision: Upgrade the official GitHub workflow actions to `actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-artifact@v7`, and `pnpm/action-setup@v6` while retaining the pinned project toolchain (`node 24`, `pnpm 11.9.0`).
- Alternatives: Ignore the Node 20 deprecation annotations; pin obsolete action majors; change the application runtime together with the workflow actions.
- Reason: The previous action majors completed the release gate but emitted deprecation annotations because their bundled runtime was Node 20. Updating the actions removes a future CI failure risk without changing application code or package resolution.
- Impact: Repository checkout, pnpm installation, dependency caching, SBOM upload, and the complete release gate must be re-proven on the current GitHub-hosted runner.
- Revisit when: GitHub announces a runner-runtime deprecation, the selected action majors stop receiving fixes, or supply-chain policy moves from major tags to reviewed commit-SHA pins.
- Status: Decided.

## D-037 - Launch capture owns and isolates its production server

- Date: 2026-07-27
- Decision: Run launch-asset capture through a repository script that refuses an already occupied port 3000, starts the local production server with AI disabled, and stops only the exact child process it created.
- Alternatives: Reuse any server found on port 3000; ask the operator to start and stop a server manually; terminate every local Node process after capture.
- Reason: Repeatable capture should not depend on an unknown server build and must not interfere with another project when several Codex workspaces are active on the same Windows PC.
- Impact: `pnpm capture:launch` now has the same exact-process isolation boundary as the E2E runner. A port collision fails closed instead of reusing or terminating another process.
- Revisit when: Capture moves into a containerized CI job or the production-server lifecycle is consolidated into a shared tested runner.
- Status: Decided.

## D-038 - CI does not bootstrap through an advisory-affected pnpm release

- Date: 2026-07-27
- Decision: Remove `pnpm/action-setup` from CI and use the Corepack distributed with the pinned Node 24 runtime to activate the exact `pnpm@11.9.0` declared in `package.json`.
- Alternatives: Accept the action's transient audit warning; use its standalone executable mode; install pnpm globally with npm; wait for another action release.
- Reason: `pnpm/action-setup@v6.0.9` first installs its committed pnpm 11.7.0 bootstrap package, which reports one high-severity vulnerability, before self-updating to the project's patched 11.9.0. Release evidence should not normalize or hide an advisory-affected bootstrap stage.
- Impact: CI loses the convenience action and its pnpm-store cache integration, but removes the affected transient package. The frozen lockfile, full audit, tool version, build, SBOM, and browser gates remain unchanged and must pass again.
- Revisit when: The action bootstrap is patched beyond the relevant advisory and a measured CI-duration benefit justifies reintroducing it.
- Status: Decided.

## D-039 - Public link previews use one static first-party brand asset

- Date: 2026-07-27
- Decision: Add one 1200×630 InnerArc social card, native Korean/English titles and descriptions, and explicit Open Graph/X metadata. Serve the same raster through first-party static image routes with accessible alt, type, and dimension fields.
- Alternatives: Share raw result cards; use a remote image CDN; omit preview imagery; guess an unapproved production domain; generate a personalized preview per user.
- Reason: Shared links need recognizable premium product identity without exposing a birth date, name, question, relationship context, or generated result. One static asset keeps previews consistent, cacheable, and independent of external tracking or storage.
- Impact: The image contains only the public brand, number 11, and abstract card backs. `NEXT_PUBLIC_APP_URL` accepts loopback locally and requires a path-free HTTPS origin for production. Two localized browser cases verify the complete preview response in both Chromium and mobile.
- Revisit when: The final brand name/domain is cleared or a qualified native-language/brand review requests localized image variants.
- Status: Decided.

## D-040 - Release tooling supports explicit alternative ports without process reuse

- Date: 2026-07-27
- Decision: Keep port 3000 as the default, fail closed when it is occupied, and allow an explicit validated `E2E_PORT` or `CAPTURE_PORT` for a repository-owned server. Forward the exact E2E origin into Playwright.
- Alternatives: Stop the occupying process; attach to whatever responds on 3000; scan automatically for a free port; block all validation until the other project stops.
- Reason: Another active workspace can legitimately own the default port. Automatic reuse, termination, or silent port scanning would weaken isolation, while an explicit alternative preserves operator intent and deterministic metadata origin testing.
- Impact: Invalid or occupied alternatives still fail. The runner continues to terminate only its own direct server child; every E2E origin assertion reads the exact forwarded base URL instead of hardcoding port 3000, and no file, process, or configuration in the other workspace changes.
- Revisit when: Test execution moves into isolated containers with allocated ephemeral ports and equivalent ownership evidence.
- Status: Decided.

## D-041 - Share cards use an explicit local PNG and native file-share boundary

- Date: 2026-07-27
- Decision: Keep the existing allowlisted share payload and SVG renderer authoritative, derive a 1080×1350 PNG only in browser memory after a click, and pass exactly one generic-titled PNG to the native share surface when file sharing is supported. Retain explicit PNG/SVG downloads; use PNG download as the unsupported or technical-failure fallback, but never after user cancellation.
- Alternatives: Keep SVG download only; upload cards to a share service; encode the result in a public URL; share free text; silently copy to the clipboard; add a third-party rasterization dependency.
- Reason: Mobile users need a direct path from a safe result card to their chosen app, while public URLs, uploads, clipboard mutation, remote rasterizers, and text envelopes would expand privacy and tracking risk. The existing renderer already enforces the product's strongest allowlist boundary.
- Impact: The browser creates no new record or remote request. The operating-system share surface opens only from a user gesture, receives one PNG with no `text` or `url`, and has a clearly disclosed external-app boundary. Unsupported browsers still receive a portable PNG without losing the editable SVG option.
- Revisit when: Real share completion and trust evidence exists, a native app has an approved share-sheet implementation, or brand review changes the card format.
- Status: Decided.

## D-042 - Reality Check return work starts with a local action-first queue

- Date: 2026-07-27
- Decision: Derive one in-memory review queue from records already available to the Reality Check page. Put ready outcomes first by earliest review date, retain planned and reviewed filters, and expose a single next-ready action. Do not add background reminders or read device storage until the user invokes the existing load control.
- Alternatives: Automatically inspect browser storage on page open; request notification permission; add email reminders before identity and delivery infrastructure; keep creation-order cards with no return priority.
- Reason: Outcome return is the product’s primary differentiator, but a useful first improvement can be delivered without a new sensitive field, permission prompt, server, analytics event, or hidden device-history access.
- Impact: Queue state and filters are memory-only, source records remain unchanged, and the existing session/device-opt-in retention boundary remains authoritative. Authenticated cross-device reminders are still blocked on approved identity, retention, delivery, and consent infrastructure.
- Revisit when: Production return-rate evidence supports reminders and the account/privacy/notification gates have passed.
- Status: Decided.

## D-043 - Valid PayApp configuration opens checkout without a second approval gate

- Date: 2026-08-01
- Decision: Remove the environment/database launch-approval toggle and its administrator endpoint. Treat valid provider credentials, reachable persistence, valid HTTPS callbacks, and the code-owned product catalog as payment readiness. Retain the independent incident sales-pause control and always accept provider callbacks for payments already in progress.
- Alternatives: Keep the typed administrator approval; keep an environment flag; force-open checkout with an emergency override; fall back to manual bank transfer.
- Reason: The redundant approval state repeatedly left a correctly configured live merchant unable to take payment and made recovery depend on a hidden setting. The user explicitly requires immediate normal PayApp checkout. Configuration validation, server-owned amounts, callback signature checks, idempotency, rate limits, administrator allowlisting, and refunds remain intact.
- Impact: The retired 19,000 KRW offer remains unavailable; new orders use 9,600 KRW and 39,000 KRW. Checkout does not depend on a deployment toggle, while malformed credentials, stale declared prices, an unavailable database, invalid requests, and provider rejection still fail safely.
- Revisit when: The payment provider, legal entity, or checkout risk model materially changes and a separate auditable release control has a demonstrated operational owner.
- Status: Decided.

## D-044 - Birth dates are entered in the solar/Gregorian calendar

- Date: 2026-08-01
- Decision: Label every birth-date input as solar calendar in Korean and Gregorian calendar in English. Accept the browser's ISO Gregorian date directly and do not infer or convert lunar-calendar dates.
- Alternatives: Leave the calendar system implicit; offer a lunar/solar switch; automatically infer the calendar; add lunar conversion in the current release.
- Reason: The deterministic numerology engine requires one unambiguous civil date, and the user explicitly requires solar-calendar input. Automatic inference can silently calculate from the wrong date, while a lunar converter needs a separately specified and verified rule set.
- Impact: Onboarding, relationship, compatibility, celebrity comparison, and paid-report intake now identify the required calendar system. Existing ISO-date calculation behavior is unchanged.
- Revisit when: A versioned, tested lunar-calendar conversion module and corresponding privacy-safe UX are approved.
- Status: Decided.

## D-045 - PayApp checkout uses one explicit payment action

- Date: 2026-08-01
- Decision: Present `바로 결제하기` as the product action. After the existing client validation and server-side order creation succeed, save the guest report recovery link and navigate directly to the PayApp-hosted checkout in the same tab. Do not render a second local PayApp confirmation panel.
- Alternatives: Keep `결제수단 불러오기` followed by a second `결제하기` button; open PayApp in a popup; expose payment-method buttons locally; create an order only after a second confirmation.
- Reason: The two local actions described one checkout and made users think payment was unavailable or unfinished. PayApp already owns payment-method choice and final authorization, so a second local confirmation adds friction without adding protection.
- Impact: Phone validation, order idempotency, server-owned price, throttling, sales pause, callback verification, cancellation, and recovery remain unchanged. A successful click enters PayApp directly; failed validation or order creation stays on the page with the existing error message.
- Revisit when: The active production provider changes to one that must render an embedded agreement or payment-method widget before its payment request.
- Status: Decided.

## D-046 - Simplicity means one visual priority per purchase step

- Date: 2026-08-01
- Decision: Preserve the core self-understanding headline, report examples, product differences, required inputs, privacy, payment recovery, and legal disclosures while reducing decorative geometry, repeated prompts, nested dark surfaces, heavy shadows, and simultaneously competing buttons. Keep secondary legal detail collapsed until requested.
- Alternatives: Redesign every feature route; remove explanatory content; keep the existing decorative layers; replace the visual identity entirely.
- Reason: The primary journey was complete but visually dense, especially on a phone. Removing core explanation would reduce trust, while reducing decoration and repeated hierarchy improves comprehension without changing product meaning.
- Impact: The home and plans journey has a calmer hierarchy, three floating prompts instead of nine, one primary hero action, lighter form surfaces, simpler product cards, and a direct checkout action. Functional analysis and report routes retain their information-rich structures.
- Revisit when: Production analytics or user testing shows that a retained section does not help product comprehension, checkout completion, or safe use.
- Status: Decided.
## D-056 - Conversion analytics is a strict provider-neutral browser event boundary

- Date: 2026-08-02
- Decision: Expose the ten requested landing-to-payment events as schema-validated
  `gyeol:analytics` browser events without attaching a network sink. Product and
  provider codes are allowlisted; birth dates, names, raw questions, and extra text are
  rejected.
- Alternatives: Add a third-party analytics SDK immediately; store raw funnel events
  in Supabase; omit conversion instrumentation.
- Reason: The current product has no approved analytics processor, while conversion
  measurement needs a stable integration boundary that cannot accidentally collect the
  sensitive reading input.
- Impact: Product code can instrument the complete funnel now. A future approved
  adapter can subscribe later, but must honor product-analytics consent before storing
  or transmitting anything.
- Revisit when: A processor, retention period, consent implementation, and production
  data-processing terms are approved.
- Status: Superseded by D-059 for aggregate operational counts; user-level analytics
  remains disabled and consent-gated.

## D-057 - The mobile purchase bar yields to intake instead of overlaying it

- Date: 2026-08-02
- Decision: Keep one compact, opaque Detailed-reading bar only outside the intake
  viewport and remove it as soon as the form intersects the screen.
- Alternatives: Keep the bar permanently; reserve a large blank footer behind it;
  remove the bar everywhere.
- Reason: The bar helps a scrolling visitor retain price/action context, but covering
  labels, errors, or input controls directly harms completion and accessibility.
- Impact: The first screen retains a clear mobile checkout route, while form controls
  and inline errors remain unobstructed at 320–430 px and safe-area insets.
- Revisit when: Measured mobile completion shows that the sticky action adds no value.
- Status: Decided.

## D-058 - Differentiate from 사주명리 without an accuracy claim

- Date: 2026-08-02
- Decision: Place `사주명리와는 다른, 현실 선택 중심의 리딩` above the home
  headline instead of `사주명리보다 정확한`.
- Alternatives: Publish the requested comparative-accuracy claim; omit the comparison;
  describe only the calculation method.
- Reason: No controlled evidence supports a claim of greater accuracy, and the product's
  own policy prohibits unsupported accuracy language. The chosen line preserves the
  intended contrast by naming the real product difference: practical choice criteria.
- Impact: The first viewport gains the requested positioning cue without implying
  scientifically verified superiority or denigrating another symbolic system.
- Revisit when: A legally reviewed, reproducible comparative study supports a narrower
  substantiated claim.
- Status: Decided.

## D-059 - Limit administrator editing and store only aggregate operations metrics

- Date: 2026-08-02
- Decision: Let the allowlisted owner edit the Korean and English hero kicker,
  headline, explanation, and primary CTA, while keeping pricing, checkout, safety,
  and legal copy code-controlled. Store landing-to-payment measurement as anonymous
  event markers in a dedicated private Supabase Storage bucket, then expose only daily
  counts by language, event, and one allowlisted category.
- Alternatives: Give the administrator arbitrary HTML/CSS access; connect a third-party
  tracker; store raw events and persistent visitor IDs; expose no editing or metrics.
- Reason: The owner needs routine control and operating visibility, but unrestricted
  layout or raw-event access can break checkout, introduce unsafe claims, or collect
  sensitive reading data.
- Impact: Routine first-screen copy changes no longer require deployment. The console
  shows page views and conversion steps without storing personal inputs, IP addresses,
  accounts, or session identifiers. Unique visitors are intentionally unavailable.
- Revisit when: A reviewed CMS role model or consented user-level analytics processor
  is approved with retention and deletion rules.
- Status: Decided.

## D-060 - Quarantine untrusted static image formats until the upstream parser fix ships

- Date: 2026-08-11
- Decision: Keep `image-size@2.0.2` only as vinext's build-time transitive dependency,
  prohibit untrusted ICNS, JXL, and HEIF inputs in that path, and temporarily ignore
  only GHSA-w3rx-r6r6-pgpr and GHSA-5p2g-fcmc-qvqq in the CI audit.
- Alternatives: Disable the dependency audit; pin the advisory-listed 2.0.3 release
  before it exists in npm; replace vinext without compatibility evidence.
- Reason: Both advisories describe infinite-loop denial of service, but npm currently
  publishes no patched `image-size` release. A narrow format boundary preserves a
  meaningful audit gate without pretending an unavailable package can be installed.
- Impact: Trusted repository assets continue to build. Untrusted ICNS, JXL, and HEIF
  assets must not enter the build, and the two-advisory exception remains visible.
- Revisit when: Weekly, and immediately when a patched release or verified upstream
  replacement becomes installable. Remove both the exception and this quarantine.
- Status: Temporary exception; blocks untrusted use of the affected formats.

## D-061 - Version Saju facts and fail closed on unvalidated lunar conversion

- Date: 2026-08-21
- Decision: Extend the existing deterministic Saju engine with an explicit stored policy,
  five version identifiers, canonical structured facts, stable relationship rule IDs, and
  immutable recalculation schema. Represent lunar/leap-month requests but reject them until
  a Korean converter passes two-source validation.
- Alternatives: Let an AI infer pillars; accept a generic East Asian lunar converter;
  replace the existing engine with a new package; store rendered prose only.
- Reason: One conversion or boundary defect can corrupt every downstream interpretation.
  Explicit rejection is safer than a plausible but unverifiable chart, and extending the
  tested module preserves working behavior.
- Impact: Existing Gregorian Saju UI remains compatible. The new persistence migration is
  inactive until RLS/export/deletion staging gates pass. No product or price changes.
- Revisit when: KASI-table coverage and an independent converter agree over the supported
  range, with disagreements documented rather than silently resolved.
- Status: Decided; lunar conversion and production persistence remain held.

## D-062 - Advance the Nano ID security override to 3.3.18

- Date: 2026-08-21
- Decision: Replace the explicit `nanoid@3.3.17` transitive override with patched 3.3.18.
- Alternatives: Ignore GHSA-2v37-7h3g-55p8; remove the override and accept resolver drift.
- Reason: The production dependency audit reported a high-severity infinite-loop advisory
  in the existing pinned release. PostCSS supports the patched 3.x version.
- Impact: Lockfile-only dependency change; full verification and both production builds
  must remain green. No application behavior or runtime secret changes.
- Revisit when: The parent dependency graph no longer requires an override.
- Status: Decided.

## D-063 - Isolate the Saju service menu behind a dedicated route

- Date: 2026-08-21
- Decision: Keep the main and free-pattern screens focused, add a single route button to
  `/[locale]/fortune`, and place the mobile card menu and bottom navigation on that route.
  Link only implemented services; mark unimplemented daily and yearly flows as unavailable.
  Do not invent character art, character stand-ins, Han-character badges, or placeholder
  icon glyphs; character assets remain empty until the product owner supplies them.
- Alternatives: Insert the full Saju catalog into the existing main and numerology pages;
  copy a third-party Saju service's brand, characters, copy, or artwork; expose placeholder
  cards as working services.
- Reason: A separate hub preserves the current launch funnels while giving Saju a clear,
  app-like entry point. Original styling and honest availability labels avoid brand confusion
  and unsupported product claims.
- Impact: Adds one reversible presentation route and entry links. No calculation, storage,
  payment, entitlement, privacy, or deployment behavior changes.
- Revisit when: Demand evidence supports implementing one of the unavailable flow services,
  with success and safety guardrails defined before it becomes interactive.
- Status: Decided.

## D-069 - Add consent-gated gift delivery and a Japanese purchase entry

- Date: 2026-08-21
- Decision: Redesign the public product comparison with the supplied first-party guide art;
  let a purchaser explicitly mark a reading as being for another person; require their
  confirmation that the person consented; and expose user-initiated email, native device
  sharing (including KakaoTalk when installed), and link copy on the protected report.
  Add reviewed Japanese home, intake, and plan routes without widening deterministic report
  rules until full Japanese report copy is separately reviewed.
- Demand evidence: Direct product-owner request after reviewing the live plan and report
  flows. Distribution is the public home/plan funnel and recipient-initiated email or mobile
  share destination; the application does not collect a recipient address.
- Economics: Existing 5,500/39,000/79,000 KRW one-time prices and historical 9,600/39,000
  campaign evidence remain unchanged. Browser `mailto`, Clipboard, and Web Share add no
  provider or fulfillment fee. A future Kakao SDK/server sender would require key, CSP,
  privacy, provider-cost, and delivery review before activation.
- Safety/claim boundary: Gift consent is explicit; share copy warns that an accessible link
  exposes personal report content; numerology/tarot remain symbolic reflection rather than
  prediction, diagnosis, treatment, or guaranteed outcomes.
- Success and guardrails: Measure plan-to-intake and completed checkout with the existing
  enumerated anonymous funnel only. Guard on consent visibility, no recipient PII collection,
  no automatic transfer, authorization/entitlement preservation, Japanese route completion,
  and zero new third-party browser requests. Revert the gift panel or `/ja` routes if any
  unauthorized disclosure, broken checkout handoff, misleading language, or material
  conversion regression is observed.
- Rollback reference: `93e09be3527810461cdb324bf89957307da18e7c` (production v61).
- Status: Decided and additive; no migration or payment configuration change.

## D-070 - Open an accessory recommendation storefront before accessory checkout

- Date: 2026-08-21
- Decision: Replace the closed category preview with a public storefront foundation that
  distinguishes five Saju phase directions from three deterministic Numerology fact
  directions, links into it from both systems, discloses made-to-order shipment within 30
  days after payment, and reserves an isolated administrator list for future
  `accessory_*` payment orders. Keep prices, item photos, inventory, shipping-address
  collection, and checkout controls closed until real products pass the existing twelve
  commerce gates.
- Demand evidence: Direct product-owner request to recommend accessories from Saju and
  Numerology results, communicate a 30-day fulfillment window, accept future payment, and
  separate those orders in the owner console.
- Distribution and economics: Distribution is limited to existing result/Saju routes and
  the first-party shop. Existing 5,500/39,000/79,000 KRW digital pricing and historical
  9,600/39,000 campaign evidence remain untouched. Product COGS, packaging, domestic
  postage, payment fees, returns, labor, VAT, and loss allowance are unknown, so no
  accessory price or gross-margin claim is published and no payment can be created.
- Safety and claims: “Holding energy” is disclosed as a symbolic design concept only.
  Accessories do not promise luck, protection, healing, love, money, performance, or a
  changed reading. Material, allergen, nickel, dimensions, care, origin, supplier, inventory,
  returns, and consumer-law evidence remain launch gates.
- Metrics and reversal: Existing allowlisted anonymous shop/result navigation may measure
  demand without raw profile facts. Open checkout only after approved SKU evidence and a
  unit-economics review. Revert the storefront or recommendation link if it creates purchase
  confusion, unsafe material inference, outcome claims, or a material digital-reading funnel
  regression.
- Rollback reference: production v62, commit
  `8db497064f423162407e825f2adf89ee82614120`.
- Status: Storefront foundation decided; accessory checkout and production schema remain held.

## D-071 - Pre-generate result-family accessory concepts without selling an unverified SKU

- Date: 2026-08-22
- Decision: Add eight first-party AI concept boards covering five Saju phase families and
  three Numerology fact families, and let the visitor switch them in a vending-machine-style
  selector without putting personal calculation facts in the URL. Mark every image as an AI
  concept rather than a delivered-item photograph. Show current marketplace-reference price
  ranges, no finished-goods inventory, one-to-one made-to-order production, collect-on-delivery
  shipping, and the statutory return boundary. Keep checkout closed until a matching real item
  passes all product and fulfillment gates.
- Demand evidence: The product owner directly requested a varied pre-generated AI image system
  that responds to Saju/Numerology variables, market-referenced pricing, one-to-one production,
  collect shipping, and a no-return operating policy. Distribution remains the existing public
  result links and `/[locale]/shop`; no new ad network, affiliate link, or recipient transfer is
  added.
- Price and economics evidence: August 2026 Korean handmade-marketplace samples place small
  key/carry items around 6,900–35,000 KRW, common bracelets and pendants around 19,000–69,300
  KRW, some Saju five-phase bracelets around 38,250 KRW, and highly customized silver work
  around 99,000 KRW. The UI therefore publishes category-dependent indicative ranges of
  19,000–99,000 KRW, not a checkout price. Existing digital 9,600/39,000 campaign evidence and
  current digital pricing are unchanged. Product COGS, maker labor, packaging, payment fees,
  VAT, failed delivery, collect-shipping handling, rework, and defect/refund reserves remain
  unknown, so accessory gross margin and payment activation remain blocked.
- Consumer and claim boundary: A blanket `반품 불가` statement is not published. Korean
  electronic-commerce rules generally allow withdrawal and permit a custom-production
  exception only under its conditions and prior measures. The store states that change-of-mind
  withdrawal may be restricted after customer-specific production begins with a separate
  pre-purchase notice and consent, while defects, wrong delivery, or divergence from the
  description/contract retain statutory remedies. Concept art makes no luck, healing,
  protection, relationship, financial, or predictive claim.
- Success and guardrails: Measure only existing anonymous allowlisted shop navigation. Guard on
  eight unique local concept assets, visible concept labeling, deterministic in-page switching,
  no profile data in URLs/storage, no exact price or buy control, legal-rights copy, keyboard
  operation, mobile layout, and zero remote image request. Revert this selector if visitors
  confuse concept art with delivered goods, price ranges create a material mismatch, any
  material safety inference appears, or the reading funnel materially regresses.
- Rollback reference: production v63, commit
  `eebeec00f6bee4da3fe5bc4e0aa96741e212e942`.
- Status: Concept vending and operating disclosures decided; accessory checkout, SKU catalog,
  supplier commitment, and production schema remain held.

## D-072 - Expand concept breadth through individually described product slots

- Date: 2026-08-22
- Decision: Treat the three photographed candidates in each of the eight approved concept
  boards as separate catalog entries, producing 24 visible product concepts: 15 Saju phase
  products and nine Numerology fact products. Give every entry its own name, type, description,
  design/production direction, suggested use, care/pre-purchase check, and indicative price
  range. Reuse the existing local concept board as a cropped presentation source and retain the
  AI-concept label; do not imply that the crop is a delivered-item photograph.
- Demand evidence: Direct product-owner feedback on the live v64 storefront said the catalog
  felt too small and required complete per-product descriptions. Distribution remains the
  existing result-to-shop links and public shop; no paid acquisition or affiliate placement is
  added.
- Economics: The catalog still spans the approved indicative 19,000–99,000 KRW market-reference
  envelope. Existing 9,600/39,000 campaign evidence and digital checkout economics do not change.
  Because material, maker labor, packaging, payment fee, VAT, collect-shipping handling, rework,
  defect reserve, and supplier commitment remain unknown per item, the new cards are not SKUs,
  do not state margin, and do not open checkout.
- Safety and claims: Descriptions distinguish visual form, possible material direction, use,
  and care. They do not claim luck, protection, healing, relationship, financial, diagnostic,
  or predictive effects. Any metal, resin, glass, ceramic, textile, or leather-alternative
  wording remains a direction pending physical sample and allergen/provenance review.
- Success and guardrails: Require 24 unique stable IDs, 15/9 source split, four complete
  description fields in both Korean and English, visible concept labels, keyboard-accessible
  structure, mobile readability, no remote image request, and no added checkout control. Revert
  the expanded grid if long-page performance materially regresses, descriptions imply approved
  materials, product crops become misleading, or shop-to-reading navigation deteriorates.
- Rollback reference: production v64, commit
  `8abaa72c996b1f8b74298f9cb9458cd8c5ac3814`.
- Status: Decided and additive; supplier-backed SKU activation remains held.

## D-073 - Separate product imagery and add concept-only detail pages

- Date: 2026-08-22
- Decision: Replace each catalog card's ambiguous crop of a three-product family board with
  a product-specific first view, then add one stable Korean/English detail route per concept.
  Each route shows front, three-quarter, and side/back construction concepts, the complete
  description, selection criteria, care checks, related candidates, and made-to-order
  boundaries. All new images remain explicitly labelled AI concepts rather than delivered-item
  photographs, and checkout remains closed.
- Demand evidence: Direct owner feedback on the deployed shop identified that one card image
  could be mistaken for another product and requested marketplace-style detail pages with
  multiple angles and written guidance for product selection. Distribution remains the public
  first-party shop and product-detail URLs; no advertising, affiliate, or external image host is
  added.
- Economics: Detail pages retain the existing indicative 19,000–99,000 KRW reference ranges.
  Existing 9,600/39,000 campaign evidence and digital prices are unchanged. Supplier, material,
  labor, packaging, payment fee, VAT, collect-shipping handling, rework, defect reserve, and
  gross-margin evidence remain incomplete, so the detail routes cannot create an accessory
  order or present a checkout control.
- Safety and claim boundary: Multiple-angle images describe shape and possible construction
  only. They do not establish actual material, dimensions, finish, safety, provenance, or
  efficacy, and make no luck, protection, healing, relationship, financial, diagnostic, or
  predictive claim. The first purchase-status surface states that real-item photography and
  disclosures are required before checkout opens.
- Success and guardrails: Require 24 unique detail URLs in each supported language, three
  labelled viewpoints per product, one product identity per catalog card, accessible navigation,
  mobile layout, first-party images, no profile data, and no cart/buy/checkout control. Revert
  the detail imagery and routes if product identity drifts between angles, users mistake concepts
  for manufactured goods, shop payload materially regresses, or purchase controls appear early.
- Rollback reference: production v66, commit
  `e6f47aa0e41e1da10eae2679c4592aa73957911b`.
- Status: Detail browsing decided and additive; supplier-backed SKU activation remains held.

## D-074 - Add local birth-date curation and a warmer editorial shop palette

- Date: 2026-08-22
- Decision: Place a birth-date curation form in the first shop viewport. Calculate Life Path,
  Attitude, and current Personal Year locally with the existing deterministic Numerology engine,
  then map each fact to one of the three already approved concepts in its result family. Show one
  primary and two supporting product links. Do not infer a Saju result from birth date alone;
  explain that Saju remains a separate chart flow with additional inputs. Refresh the shop with
  a wine, coral, apricot, sage, teal, champagne, ivory, and rose editorial palette inspired by
  premium color systems without claiming licensed Pantone matching or adding false urgency.
- Demand and distribution: Direct owner feedback on production v67 asked for birthday-only
  product recommendation at the top and a more purchase-oriented, harmonized color system.
  Distribution remains the existing first-party home, result links, and public shop; no ads,
  affiliate placement, retargeting, or external personalization provider is added.
- Economics: This changes discovery only. The existing 19,000–99,000 KRW indicative accessory
  ranges and 9,600/39,000 KRW digital economics are unchanged. Supplier, material, labor,
  packaging, fees, tax, collect-shipping handling, rework, defects, and margin are still unknown,
  so the recommendation does not create an order, discount, scarcity message, or checkout.
- Privacy and safety: The raw birth date stays in component memory, is not persisted, transmitted,
  placed in a URL, or written to analytics. Output shows only three derived numbers and public
  product concepts. Copy identifies the recommendation as symbolic selection guidance, separates
  Saju and Numerology, and makes no efficacy, prediction, luck, protection, healing, relationship,
  or financial claim.
- Success, guardrails, and reversal: Require deterministic 1994-11-04 coverage, three stable
  recommendations, Korean/English labels, reload-cleared state, no URL mutation, keyboard and
  mobile usability, WCAG contrast, and unchanged page-weight budgets. Evaluate only allowlisted
  anonymous shop navigation and detail-entry counts. Revert the curation and route-scoped palette
  together if visitors read it as Saju, birth dates persist or leave the page, accessibility or
  performance regresses, or visual emphasis obscures the concept/checkout-closed disclosures.
- Rollback reference: production v67, commit
  `e84f50e74929d84fbb7dfa15814f2a0ae2152419`.
- Status: Decided and additive; accessory checkout remains held.

## D-075 - Add product-image zoom and search discovery foundations

- Date: 2026-08-22
- Decision: Make every product-detail viewpoint an accessible zoom trigger with a modal
  viewer, viewpoint switching, 100–300% controls, reset, focus return, and Escape dismissal.
  Replace CSS-only product artwork with semantic first-party images. Add unique Korean/English
  search metadata for Saju, fortune, daily flow, Numerology, relationships, shop, and product
  routes; publish canonical/hreflang signals, WebSite/WebPage/Breadcrumb structured data, the
  missing public Saju sitemap entries, and a separate first-party image sitemap. Keep private
  reports, orders, profiles, payments, and administration excluded from crawling.
- Demand evidence and distribution: Direct owner feedback on production v68 required detailed
  product enlargement and discoverability for Saju, destiny-number, and fortune searches across
  Naver, Google, and other portals. Distribution is organic first-party search discovery only;
  no paid placement, backlinks, review fabrication, search-volume claim, ranking guarantee, or
  user-level tracking is introduced. Portal ownership verification and sitemap submission remain
  operator-account actions because repository code cannot prove account ownership.
- Economics: This changes product inspection and organic discovery only. The existing
  19,000–99,000 KRW indicative accessory ranges and 9,600/39,000 KRW digital economics are
  unchanged. No SKU, inventory, checkout, provider, fulfillment, tax, shipping, return, or
  margin assumption is added, and accessory checkout remains closed.
- Safety and claims: Search copy explicitly separates Saju and Numerology and describes readings
  as symbolic reflection rather than scientific prediction, diagnosis, guaranteed destiny, or
  guaranteed fortune. Product structured data describes a web page and concept imagery; it does
  not publish an Offer, availability, rating, review, or manufactured-product claim.
- Success, guardrails, and reversal: Require keyboard/mobile zoom, focus restoration, reduced
  motion, visible AI-concept labels, semantic image alt text, canonical locale URLs, page and image
  sitemaps, index/follow only on public routes, and no private URL or personal input in discovery
  documents. Track only allowlisted anonymous search landing and public route counts after consent.
  Revert if zoom traps focus or scroll, product identity drifts, metadata promises prediction or
  sale, private routes enter a sitemap, page weight materially regresses, or portals report
  structured-data violations.
- Rollback reference: production v68, commit
  `811801afb105b6e084b2cc838654a35813f77724`.
- Status: Decided and additive; accessory checkout remains held.

## D-076 - Run a three-day 1,500 KRW digital-reading campaign and referral coupon

- Date: 2026-08-23
- Decision: From 2026-08-23 00:00 through 2026-08-26 00:00 Korea time, charge
  1,500 KRW for each digital reading. One server clock controls display, order creation,
  and provider amount verification; stale tabs fail with `PRICE_CHANGED`. Show a once-per-session
  home-entry modal, small Event/FAQ links, and a bilingual event page. A friend-share action issues a
  signed, phone-bound 5,000 KRW coupon usable once after the campaign and before 2026-09-26 Korea
  time on a 39,000 KRW+ reading. It cannot stack with the campaign.
- Demand and distribution: Direct owner instruction requested the price, popup, event/FAQ page,
  service/result sharing, and friend coupon. Distribution is first-party entry chrome, the event
  page, native device sharing, and existing protected-report email/native/copy controls. No paid
  media, contact upload, automatic message, or fabricated endorsement is added.
- Economics: The normal 5,500/39,000/79,000 KRW prices become 1,500 KRW (-73%/-96%/-98%) for
  72 hours. This is below the historical 9,600/39,000 KRW campaign reference and is an acquisition
  experiment, not a sustainable list price. Exact provider fee, generation, support, VAT, refund,
  and chargeback costs remain unknown; payment readiness and the sales-pause control stay mandatory.
  The coupon leaves 34,000 or 74,000 KRW gross receipts and is barred from the 5,500 KRW product.
- Privacy, safety, and abuse: Coupon issuance handles a Korean mobile number transiently, derives
  an HMAC, returns a signed bearer code, and stores no raw number or recipient contact. InnerArc
  never sends the invitation. Checkout binds the code to the issuing phone and rejects a second
  non-cancelled discounted order. Protected-report sharing retains subject consent. Copy preserves
  the symbolic-reflection boundary and makes no prediction, diagnosis, treatment, or outcome claim.
- Success and guardrails: Review anonymous event visits, checkout starts/completions, provider
  failures, support contacts, refunds/chargebacks, and receipts by product. Pause sales if provider
  rejection, duplicate-order contacts, refunds, or report-finalization failures materially rise.
  Prices reverse automatically. Remove coupon issuance if abuse, phone-binding failure,
  accessibility regression, or negative net economics appears.
- Performance evidence: the additive global chrome raises the measured first-party ceiling to
  40 resources and 175.7 KB decoded CSS. Guardrails are recorded at 40 resources and below
  180 KB CSS; reverse the chrome if either bound is exceeded.
- Rollback reference: `1714d1412e7c417a0c7466eac9d889b1fe662bac`.
- Status: Decided as a bounded, reversible acquisition experiment.

## D-077 - Add evidence-bound long-form life context to the Saju webtoon

- Date: 2026-08-23
- Decision: Keep the full illustrated webtoon report and add deterministic long-form prose
  scenes for the day-master core, childhood role, possible family expectations, learned coping,
  friendship, close relationships, work conditions, money habits, recovery environment, long-term
  orientation, and closing action. Every scene is selected from calculated pillar positions,
  ten gods, strength, structure, and phase balance. Optional report name/nickname personalizes the
  address; an unknown birth time leaves the hour-dependent scene explicitly open. Calculation
  evidence remains later in the same report and historical stored reports remain unchanged.
- Demand and distribution: The owner supplied ten SMS screenshots and clarified that the desired
  result is a connected consultation-style narrative inside the existing webtoon, not a replacement
  almanac table or short labels. Distribution stays within the purchased Saju report and fixed public
  sample; no new message provider, contact collection, automatic delivery, advertising, or external
  AI writer is added.
- Economics: The active 5,500 KRW Saju price and the bounded 1,500 KRW campaign price are unchanged.
  Prose is generated by local deterministic rules, so provider and generation cost remain zero; the
  payment, refund, support, VAT, and campaign guardrails already recorded for the SKU still apply.
- Safety and claim boundary: The reference screenshots include fixed-life, lucky direction, wealth,
  location, and investment-return claims. The product does not reproduce those claims. Childhood and
  family language is explicitly tentative and asks the reader to compare it with memory; finance and
  relationship sections defer to contracts, evidence, consent, qualified advice, and lived experience.
  Colors, directions, places, and objects cannot promise luck, healing, money, or outcomes.
- Success, guardrails, and reversal: Require all eleven narrative scenes in Korean and English,
  exact 1994-11-04 regression evidence, optional-name flow, no invented hour claims, no positive
  certainty/diagnosis/investment promise, HTML webtoon dialogue, and unchanged canonical pillars.
  Evaluate report completion and voluntary feedback only under existing consent. Revert the narrative
  module and optional-name field if readers mistake prompts for verified memories, calculation and
  interpretation drift, long scenes make mobile reading unusable, or report finalization regresses.
- Rollback reference: production v71, commit
  `16b37ce087f776ac0cf5b169b5f43ff22fb1db0b`.
- Status: Decided as additive presentation and interpretation; no calculation or migration change.

## D-078 - Add consented 09:00 Daily Flow inbox and report-source survey

- Date: 2026-08-25
- Decision: Generate one deterministic Daily Flow item at 09:00 Korea time for each signed-in
  account that separately consented to storing birth month/day for notifications. Keep independent
  in-site, daily-flow, caution, email, and paid-auto switches. A completed payment may re-enable the
  daily in-site switch only when that prior purpose-specific consent and birth month/day still exist;
  payment itself never creates consent. Add one short, fixed-choice acquisition-source question at
  the end of an authorized completed report and aggregate its answers in the allowlisted console.
- Demand evidence and distribution: The owner directly requested morning delivery, paid-customer
  automation, user on/off controls, a Higgsfield-like report-end survey, and administrator visibility.
  Distribution is limited to the owner-scoped My Page inbox and the already-authorized report. No
  contact upload, recipient message, raw referrer, search query, URL tracking, push token, SMS, or
  external ad platform is introduced.
- Economics: The 9,600/39,000 KRW unit-economics reference and current product prices are unchanged.
  Deterministic generation and Supabase rows add no model cost; scheduler/database operations and any
  future email provider's per-send, bounce, support, and suppression costs must be measured before
  email delivery is activated. Paid acquisition is not justified by a self-reported source count.
- Privacy and safety: Birth month/day, locale, time zone, consent time, switches, and seven recent
  inbox items are owner-scoped, exportable, and deleted by account deletion. Withdrawing the daily
  consent deletes the stored month/day and stops future generation. Survey values are enumerated,
  bounded, tied to proof of a completed report, excluded from public review copy, and visible only to
  the operator; account deletion removes account-linked answers. Every message retains the symbolic
  reflection and no-guarantee boundary.
- Success, guardrails, and reversal: Measure consent completion, daily on/off rate, idempotent inbox
  writes, failed jobs, seven-day inbox return, survey completion, and source distribution. Guardrails
  are zero writes without consent, one item per owner/day, no payment-created consent, no remote send
  without a configured provider, owner isolation, complete export/deletion, and mobile/keyboard
  usability. Disable the cron and daily switch if schedule/date drift, duplication, unauthorized
  access, deletion/export gaps, notification fatigue, or support complaints appear; hide the survey
  if completion harms report closing or spam/identifying text escapes the fixed schema.
- Rollback reference: production v73, commit
  `efd788b6d0f2949ea02300c1a401ff513a67672b`.
- Status: Decided as additive and reversible; email delivery remains off until a reviewed provider is connected.
