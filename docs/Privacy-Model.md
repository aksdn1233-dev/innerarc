# Privacy Model

## Data classes

- Account: email, provider ID, locale, time zone.
- Reflection: birth date, optional name/romanization, interests, questions, journal, occupation/finance concerns.
- Relationships: third-party name/label, birth date, relationship type.
- Decisions/outcomes: choice, plan, review date, result, relevance rating.
- Operations: consent receipt, masked errors, model/rule versions, cost and latency.

Birth date, names, relationship details, journals, finances, and consultation questions are sensitive product data even where law does not label every item “special category.”

## Collection and defaults

- Guest mode and optional name are first-class.
- Purpose is shown next to collection.
- AI personalization, model training, product analytics, marketing, and raw journal retention are separate opt-ins and default off.
- Deterministic calculation does not require AI consent.
- Current preview holds guest input in browser memory only.
- Daily Flow uses birth month and day rather than a full birth date. “View today” keeps those
  values in page memory only. The separate explicit daily-update action stores a versioned
  month/day preference on the device; it is validated, included in device inspect/export/delete,
  excluded from account sync, URLs, analytics, logs, and providers, and can be disabled on the
  same page. The result is recomputed from the device-local date when the page opens; there is
  no background schedule, push token, email, SMS, or external notification request.
- Onboarding focus and depth are stable non-sensitive choice IDs. The optional current concern is normalized and bounded but remains sensitive untrusted text in current-page memory. It may be shown back to the user with a “your words” label, but it is excluded from calculation evidence, URLs, share cards, browser storage, analytics, logs, and the disabled provider boundary.
- Checking AI-personalization consent in the provider-neutral preview authorizes no hidden transfer. The UI states that no approved provider is connected and the result remains local and rule-based; declining the checkbox does not reduce deterministic output.
- Personal romantic-discovery insights use only the user’s profile; they do not require or infer a third person’s birth date or identity.
- Two-person compatibility is a separate flow with a clear third-party-data notice. Labels and romanized names are optional, results are session-only in the guest MVP, and no searchable relationship directory or automatic contact matching is created.
- Celebrity comparison sends no user birth date to third-party source sites. The local engine compares a browser-memory profile with a curated public-fact dataset; source links are ordinary outbound navigation.
- Reality Check text is session-only by default. On-device persistence is a separate explicit choice, is scoped to a versioned InnerArc key, and exposes immediate JSON export and deletion. It is not described as encrypted storage on a shared device.
- A new outcome review stores a browser-local `reviewedMonth` alongside its existing UTC audit time so month grouping does not infer a calendar boundary from UTC. This adds no time-zone, coordinates, locale inference, or external transfer. It follows the record's existing session-only/device-opt-in retention and export/delete scope.
- Viewing another report month is a derived in-memory filter only. It performs no storage write, analytics event, provider request, or URL change. Older records without a local month are grouped by their saved UTC month and visibly counted as compatibility fallbacks rather than being silently mutated.
- The review queue is also a derived in-memory view. It adds no stored field and never reads `localStorage` on page open; only current-tab records or records returned by the explicit device-load control are counted. Changing its filter or moving focus to the next ready review performs no persistence, provider, notification, analytics, or URL action.
- A relationship result does not inspect saved Reality Check history automatically. The user must explicitly request outcome-informed context after the result is calculated.
- The derived context uses only category, fit rating, review time, and up to three bounded user-authored learning notes. Raw question, state, interpretation, choice, action, outcome, birth date, and name are excluded.
- The local website renders this context on-device and does not send it to the disabled AI provider. Future provider use would additionally require AI-personalization consent and the existing untrusted-data envelope.
- Continuing a selected relationship environment into Reality Check uses one current-tab `sessionStorage` item only after an explicit click. It contains generated reflection text, a public context ID, locale, rule versions, and expiry metadata—not birth date, name, number values, third-party data, exact place, or contact data.
- The handoff has a 30-minute maximum lifetime, is removed after one read, never appears in the URL, and does not create a record until the user edits or accepts the fields, chooses a review date, and submits the Reality Check form.
- Tarot questions and saved readings follow the same session-only default. On-device tarot history uses a separate versioned key so clearing it does not silently delete unrelated product data.
- Accessory and music directions are calculated locally from canonical number values. They do not require shopping history, listening history, streaming accounts, location, health, biometrics, or new persistence. Recommendation output omits raw birth date and name.
- The closed shop route receives only public category anchors. Result facts are not placed in query parameters, URLs, affiliate identifiers, or supplier requests; there are no products or transactions in the current version.
- The referral program is not active and has no public form or endpoint. Its draft
  design accepts a Korean mobile number only transiently, normalizes it server-side,
  and stores a keyed HMAC hash under a referral-specific secret. Raw numbers are not
  stored, logged, placed in URLs, analytics, or returned to clients. Self-referral and
  duplicate pairs are rejected at the database boundary.

## Connected account controls

- Supabase Auth/PostgreSQL runs in Singapore. Email authentication creates a session but does not upload device records.
- Explicit sync validates local preferences, tarot history, and Reality Checks before owner-scoped upserts. Restore validates server records again before writing device storage.
- Authenticated account export is versioned JSON. Atomic deletion removes profiles, consent receipts, tarot readings, and Reality Checks while retaining the auth identity and minimal data-rights request metadata.
- All account tables use `auth.uid()` owner policies, authenticated-only grants, and no anonymous table privileges.
- The versioned Saju schema is an inactive foundation. If enabled after staging review, it
  stores multiple people per owner, sensitive birth/time/relationship data, immutable
  canonical chart versions, and generated content as separate records. Direct clients may
  manage only their owner-scoped Saju profile metadata and read their artifacts; immutable
  calculation/audit writes remain server-only. Foreign keys cascade on account deletion,
  but account export/deletion integration must be extended and tested before collection is enabled.

## Planned controls

- Independent staging verification of cross-account isolation, session revocation, administrative access, backup aging, and restore.
- Encryption in transit and at rest; application-level encryption considered for raw journals.
- Separate secret manager and database; no secrets in client bundles.
- Development uses synthetic data; production data is not copied down.
- Masked logs, audited administrative access, short operational retention.
- Export in documented JSON/CSV; account/data/third-party deletion with job status.
- Share objects are derived, minimal, revocable, and omit full birth date and concern by default.
- Guest share SVGs are generated locally from allowlisted share payloads. They contain no remote image request, analytics identifier, account ID, exact birth date, raw question, journal, or third-party profile label.
- Guest share PNGs are derived in memory from the same validated SVG and are not uploaded, cached by InnerArc, or written to browser storage. Native file sharing runs only after a click, passes one PNG with a generic title and no text/URL, and lets the user choose the destination. Any selected operating-system or recipient app has its own privacy boundary; cancellation creates no fallback transfer.
- Purchased-report gifting is separate from the minimal public share card. It is available
  only on an already-authorized report, requires the sender to confirm the subject's consent,
  and runs only after an explicit email, native-share, or copy action. InnerArc does not
  collect the recipient's email address or Kakao identity. The selected mail/share app is a
  separate privacy boundary, and an accessible report link can reveal the personal report;
  the interface therefore tells the sender to share only with a trusted recipient. Existing
  payment cancellation, entitlement, and report-authorization checks remain authoritative.
- The accessory storefront is public and accepts no shipping address, recipient name,
  contact detail, product order, or payment while catalog gates are incomplete. Saju phase
  and Numerology-fact directions render as general first-party guidance; the shop URL does
  not carry a birth date, raw chart, question, name, or exact calculated profile. Any future
  physical-order launch requires purpose-limited address/recipient fields, retention and
  deletion rules, owner-console masking, provider disclosure, and tested account/guest order
  isolation before collection begins.
- The optional shop birth-date curator runs the existing Numerology calculation entirely in
  current component memory. It sends no request, writes no browser storage or URL parameter,
  emits no analytics property, and disappears on reload. Only the three derived public number
  labels and their concept-product matches render; the raw birth date is never included in a
  product link. It does not calculate or imply a Saju chart.
- The install manifest is presentation metadata only. No service worker is registered in the MVP, so the product does not silently pre-cache reflection routes or sensitive browser state for offline reuse.
- Open Graph and X preview metadata is static, public, and first-party. Its raster asset contains only product branding and abstract number/card motifs; no user result, input, identifier, question, journal, relationship data, tracking parameter, remote font, or third-party request is permitted.
- Security headers keep scripts, network connections, frames, forms, workers, images, and fonts on the first-party origin except for user-initiated ordinary outbound source navigation. Future analytics, AI, payment, or monitoring origins require a documented CSP/privacy change.
- Product measurement uses a strict event union with enumerated metadata. No free-text property bag exists. The production operational sink discards client event/session identifiers and properties after extracting one allowlisted category, then writes a one-byte anonymous marker under a private date/language/event/category path. The administrator sees only daily counts. The marker never contains IP address, user agent, name, birth date, question, phone number, account ID, or session ID and therefore cannot support unique-visitor claims. Optional user-level product analytics remains a separate opt-in and has no production sink.
- Billing references are server-only opaque IDs. Payment details remain with the selected payment provider; product code stores entitlement-relevant status and audit metadata rather than card data.
- AI personalization context is retrieved only for the authenticated owner and only after separate consent. Journal excerpts have an additional retention gate. Context is sent as bounded, typed, explicitly untrusted data; it is not placed in analytics, billing, or provider-cost audits.
- The OpenAI candidate envelope omits raw birth date and normalized name, sends `store: false`, and is disabled by default. It may include the optional concern only when the interpretation request is actually authorized; final provider retention/DPA/region evidence remains a launch blocker.
- Rate-limit and feature-rollout keys are opaque server references. Email, birth date, name, IP address, device fingerprint, question text, and journal content are not valid domain inputs. Edge infrastructure may separately apply short-lived IP abuse controls under the final privacy notice.
- Export and deletion operate on owner-tagged typed records. Export intentionally returns the requesting owner’s sensitive content in a versioned JSON bundle; it never includes another owner. Third-party-only deletion removes relationship records classified as third-party data without deleting the owner’s independent reflections.
- Idempotency results retain request metadata and deletion counts, not deleted content. Final production retention/tombstone and backup-aging behavior requires legal review and provider-plan evidence.

## Retention proposal

Account/profile until deletion; raw journal only for the selected period; masked security logs 30–90 days; consent/audit evidence per legal requirement; deleted data removed from primary storage promptly and aged out of backups under a documented schedule. Final periods require jurisdiction and counsel review.

## Threats

Prompt injection seeking other users’ context, insecure object references, sensitive client analytics, staff browsing, over-broad exports, duplicate writes, backup residue, and relationship-data disclosure. Each needs automated authorization/deletion tests before release.

Browser storage adds shared-device exposure, quota/corruption, and stale-retention risks. The persistent adapter validates strict shapes, field limits, real dates, timestamp order, and duplicate record/request IDs on every load; it discards the entire invalid payload safely, never stores consent merely because a checkbox was displayed, and provides a one-action clear control. The separate session handoff additionally enforces source/locale/context allowlists, one-time consumption, and a 30-minute maximum lifetime.
