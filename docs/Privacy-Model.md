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
  values in page memory only. Device-only updates remain a separate local opt-in with device
  inspect/export/delete. A signed-in person may separately consent to account-backed 09:00 Korea
  time notifications; that stores month/day, locale, time zone, consent time and switches in an
  owner-scoped table and creates at most one owner-scoped inbox row per date. Withdrawing consent
  deletes the account month/day and stops the schedule. A completed payment can re-enable the
  daily switch only when this prior consent still exists; payment never creates or substitutes
  consent. No push token, SMS, or external email request is made in the current provider-off release.
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
- The bounded 2026-08 friend-share coupon form accepts a Korean mobile number transiently,
  normalizes and HMACs it with a server-derived secret, and returns a signed coupon bound to
  that hash. The raw number is not stored, logged, placed in a URL or analytics, or sent to a
  friend. InnerArc never sends the invitation; the user chooses the destination in the device
  share menu. Checkout requires the same phone and rejects a second non-cancelled discounted
  order. The older pair-based referral migration remains an inactive draft.
- The report-end experience survey accepts one enumerated source, a source detail of at most 40
  characters only for “other,” a 1–5 usefulness choice, fixed return-intent and desired-follow-up
  choices, and a fixed preferred rhythm. It requires the same completed-report proof as feedback.
  The fixed retention answers use a versioned compact envelope inside the existing bounded survey
  field, so no contact, raw referrer, search query, IP address, device identifier, or new profile
  field is collected. Legacy source-only answers remain readable. Answers are visible only in
  aggregate/recent form to the allowlisted operator and are decoded into the account export;
  account deletion continues to remove account-linked answers. The preferred rhythm is research,
  not notification consent, and never changes notification settings. Detailed feedback and any
  public-review permission stay in the existing separately consented review flow.

## Connected account controls

- Supabase Auth/PostgreSQL runs in Singapore. Email authentication creates a session but does not upload device records.
- Explicit sync validates local preferences, tarot history, and Reality Checks before owner-scoped upserts. Restore validates server records again before writing device storage.
- Authenticated account export is versioned JSON. Atomic deletion removes profiles, consent receipts,
  tarot readings, Reality Checks, notification preferences/deliveries, and account-linked acquisition
  answers while retaining the auth identity and minimal data-rights request metadata.
- All account tables use `auth.uid()` owner policies, authenticated-only grants, and no anonymous table privileges.
- The versioned Saju schema is an inactive foundation. If enabled after staging review, it
  stores multiple people per owner, sensitive birth/time/relationship data, immutable
  canonical chart versions, and generated content as separate records. Direct clients may
  manage only their owner-scoped Saju profile metadata and read their artifacts; immutable
  calculation/audit writes remain server-only. Foreign keys cascade on account deletion,
  but account export/deletion integration must be extended and tested before collection is enabled.

## Planned controls

### First-party journey aggregates

- The operational journey marker reduces the current route and acquisition source to closed public
  categories before transmission. It does not transmit or store the raw referrer, URL, query string,
  UTM value, IP address, device identifier, server-side session, name, birth input, question, order,
  report, or share recipient.
- A route is emitted at most once per browser-tab session. The temporary tab values stay on the
  device and are never included in the request. localhost, administrator routes, declared
  automation, and operator-marked browsers are excluded.
- These counters are service-integrity aggregates, not visitor profiles or unique-person counts.
  They must not be joined to accounts, orders, reports, surveys, or marketing contacts.

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
- Public pages and first-party artwork publish refusal rules for known AI/model and bulk-dataset
  crawlers, and the Worker denies declared matching user agents before serving content. This does
  not turn public pages into confidential data: a hostile scraper can impersonate an ordinary
  browser. Purchased reports and account, order, payment, and administrator data therefore remain
  protected by authorization and owner isolation rather than crawler identity.
- Product measurement uses a strict event union with enumerated metadata. No free-text property bag exists. The production operational sink discards client event/session identifiers and properties after extracting one allowlisted category, then writes a one-byte anonymous marker under a private date/language/event/category path. The administrator sees only daily counts. The marker never contains IP address, user agent, name, birth date, question, phone number, account ID, or session ID and therefore cannot support unique-visitor claims. Optional user-level product analytics remains a separate opt-in and has no production sink.
- Billing references are server-only opaque IDs. Payment details remain with the selected payment provider; product code stores entitlement-relevant status and audit metadata rather than card data.
- AI personalization context is retrieved only for the authenticated owner and only after separate consent. Journal excerpts have an additional retention gate. Context is sent as bounded, typed, explicitly untrusted data; it is not placed in analytics, billing, or provider-cost audits.
- Customer copy names this boundary as external personalization rather than a technical provider
  label. This is presentation only: the underlying purpose-specific consent, model-training choice,
  owner-only retrieval, bounded transfer, disabled-provider default, export, and deletion behavior do
  not change.
- The OpenAI candidate envelope omits raw birth date and normalized name, sends `store: false`, and is disabled by default. It may include the optional concern only when the interpretation request is actually authorized; final provider retention/DPA/region evidence remains a launch blocker.
- Rate-limit and feature-rollout keys are opaque server references. Email, birth date, name, IP address, device fingerprint, question text, and journal content are not valid domain inputs. Edge infrastructure may separately apply short-lived IP abuse controls under the final privacy notice.
- Export and deletion operate on owner-tagged typed records. Export intentionally returns the requesting owner’s sensitive content in a versioned JSON bundle; it never includes another owner. Third-party-only deletion removes relationship records classified as third-party data without deleting the owner’s independent reflections.
- Idempotency results retain request metadata and deletion counts, not deleted content. Final production retention/tombstone and backup-aging behavior requires legal review and provider-plan evidence.

## Retention proposal

Account/profile until deletion; raw journal only for the selected period; masked security logs 30–90 days; consent/audit evidence per legal requirement; deleted data removed from primary storage promptly and aged out of backups under a documented schedule. Final periods require jurisdiction and counsel review.

Pattern Profile, hypotheses, Reality Checks, evidence events, outcomes, confidence revisions, graph links, and owner-scoped provenance records are created only by explicit signed-in actions. Account export includes these collections with row ceilings; all-data deletion removes them through the latest atomic function. Security abuse events contain pseudonymous references and no user content; their exact 30–90 day schedule and incident-hold exceptions remain a production/legal gate.

## Threats

Prompt injection seeking other users’ context, insecure object references, sensitive client analytics, staff browsing, over-broad exports, duplicate writes, backup residue, and relationship-data disclosure. Each needs automated authorization/deletion tests before release.

Browser storage adds shared-device exposure, quota/corruption, and stale-retention risks. The persistent adapter validates strict shapes, field limits, real dates, timestamp order, and duplicate record/request IDs on every load; it discards the entire invalid payload safely, never stores consent merely because a checkbox was displayed, and provides a one-action clear control. The separate session handoff additionally enforces source/locale/context allowlists, one-time consumption, and a 30-minute maximum lifetime.
## Time-bounded review prize draw

- Product feedback, consent to publish a review, and consent to enter the 2026-08-30 prize draw are
  three separate decisions. None is inferred from another.
- A draw entry stores a versioned server-authored campaign code and opt-in timestamp in the existing
  operator-only review audit note alongside existing review/order identifiers. It adds no contact,
  birth date, concern, report text, recipient, external share target, or share-completion signal.
- The event page announces a masked order number. Contact and fulfilment details are requested only
  from the verified winner after a separate notice and consent, then retained under the approved
  fulfilment/legal schedule. Draw evidence is deleted or minimized after the claim/dispute period,
  subject to qualified legal review.

## Space V1 additive data boundary (feature disabled by default)

Authenticated space projects contain room dimensions, orientation, object coordinates, analysis, applied choices and30/90-day feedback. These are personal records even without a street address. Browser-selected images are resized and re-encoded to JPEG before authenticated server transfer; server decoding/re-encoding strips metadata again. Visible faces, addresses and documents are not automatically redacted. The UI requests explicit AI-image consent; no original image or public photo URL is stored. Owner checks apply before body processing; private server image transfer is not a signed-URL upload flow.

Image metadata access expires after24 hours. Durable background cleanup removes bytes and retains race-recovery tombstones; outages can delay physical removal. Deleting a room/account immediately revokes access and queues storage removal transactionally. Existing deletion receipts never wait for the global storage queue. Export omits image bytes/object paths, preserves owner filtering and uses stable composite-key pagination. Disabling feature writes retains owner export/delete and cleanup. Hosted two-owner/storage verification remains a release gate.

## Space photo quality metadata — 2026-09-08

The browser removes EXIF by canvas re-encoding and the server decodes and re-encodes again before private storage. The server stores only bounded diagnostic numbers (pixel dimensions, luminance, contrast, edge energy, clipping ratios, status and issue codes) beside the existing private asset. It stores no EXIF, camera model, location or diagnostic thumbnail. These checks detect visibly unusable pixels; they do not identify people or prove room geometry. Stored diagnostics follow the asset's owner isolation, 24-hour access expiry, export/deletion and durable physical-cleanup path. Provider processing still requires separate consent and can be disabled independently.
