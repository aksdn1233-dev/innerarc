# Home funnel and interface design rules

Last updated: 2026-09-02

These are permanent product rules, not notes on one change. Read them before touching the
home page, `/{locale}/reading`, the free reading, the paid teaser, or anything described as
"simplifying" a surface.

## 1. The design rule

태령당 must not use generic AI-generated SaaS aesthetics. Minimalism must never remove
information required for comprehension, trust, navigation, or purchase. Guidance should be
progressive, contextual, optional, and human-designed.

In practice, for any element added to a customer-facing page:

- **Text before a card.** A sentence, a rule, and a number carry a sequence better than a
  container does. Containers are for things that are genuinely separable and clickable.
- **Sequence before dashboard.** The order of the page is the guidance. A page that has to
  explain its own layout has the wrong layout.
- **One strong action before several competing ones.** A screen with three equally weighted
  buttons has no primary action.
- **Contextual guidance before permanent explanation.** Say it where it is needed, once.

Do not introduce: card-inside-card layouts, purple/blue gradients, glow or glassmorphism,
floating pills, badge rows, decorative charts, fake chat bubbles, onboarding modals on
arrival, or animation that carries no information. Every new element must answer *yes* to at
least one of:

1. Does it help the customer understand what the service does?
2. Does it help the customer know what to do next?
3. Does it demonstrate what they will receive?
4. Does it reduce uncertainty before purchase?
5. Does it improve a measurable step of the funnel?

## 2. The regression this file exists to prevent

Removing explanatory sections to simplify visual design can create a conversion and
navigation regression. Future simplification work must test information architecture and
funnel continuity, not only visual cleanliness.

What happened, concretely (found 2026-09-02, introduced over the preceding simplification
passes):

- `/{locale}` was reduced to the opening film plus two route buttons. Its `<h1>` was set to
  `visually-hidden`, so the page contained no visible sentence saying what the service does.
- The header on that page kept five navigation links and a "리딩 시작하기" button pointing at
  `#questions`, `#preview`, `#products`, `#evidence`, `#method`, and `#onboarding` — every
  one of which had moved to `/{locale}/reading`. All six did nothing.
- The home page had no link to `/{locale}/reading` at all, so the page holding the prices,
  the reviews, the method and the intake form was reachable only from the campaign popup.
- The free reading's single purchase action linked to `/{locale}#onboarding`, landing a
  visitor who had just decided to buy on a page with nothing on it.
- The home page rendered no footer, so terms, privacy, order lookup, support and the
  business registration number were absent from the site's most-visited page.
- No analytics event fired anywhere between "start the free reading" and "arrive at
  checkout", so the drop-off could not be located even in principle.

The visual simplification itself was not the mistake. Shipping it without checking that the
navigation still had destinations, that the funnel still had a path, and that the funnel was
still measurable, was.

## 3. Regression checklist for any home, funnel, or "simplification" change

Run this before merging. It is cheap; every line below corresponds to a defect that has
actually shipped.

**Navigation**

- [ ] Every in-page anchor rendered on a surface has a matching `id` **on that same
      surface**, at every viewport width.
- [ ] Every cross-route link resolves to a route that exists and to an anchor that route
      renders.
- [ ] No source file links to `/{locale}#…`. The home page does not own those anchors.
- [ ] The page that explains and sells the product is reachable from the home page by a
      link, not only from a campaign popup.

**Information the customer needs**

- [ ] The landing page answers, in visible text, within one screen: what is this, what can
      it tell me, what do I do first.
- [ ] Terms, privacy, order lookup, support and the business registration details are
      reachable from every customer-facing page.
- [ ] Anything removed from a free surface is *named* where it used to be, not silently
      dropped.

**Funnel continuity**

- [ ] Walk the whole path in a browser: home → choose a question → free result → paid
      teaser → intake → checkout. Every step must be reachable by clicking only.
- [ ] The concern chosen at the start is still selected at the end, and is resolved on the
      server (a background tab never runs `requestAnimationFrame`).
- [ ] The purchase action on the free result names what the paid reading adds for *that*
      concern.

**Proof before payment**

- [ ] The report preview is built from `getSampleReport` / `buildReportOutline`, so its
      chapter titles are the ones the generator will deliver. Never hand-write a preview.

**Measurement**

- [ ] `landing_view → concern_selected → free_start → birth_input_complete →
      free_result_view → paid_teaser_view → paid_teaser_click → product_view →
      product_select → payment_start → payment_success → report_view` all fire from real
      components, verified in a browser, not merely declared in a schema.
- [ ] Events carry only closed-set categories (concern, surface, tier, locale). No birth
      date, name, written question, or report content.

**Mobile and accessibility**

- [ ] 320 / 360 / 375 / 390 / 430 px: no horizontal overflow, no clipped Korean text, no
      tap target under 44 px, and nothing positioned over content the visitor needs —
      including promotional chrome, which belongs in the flow.
- [ ] Keyboard reachable, reduced motion respected, axe clean on the changed routes.

## 4. When promotional chrome is allowed to interrupt

- **No dialog on arrival.** The campaign offer opens only once the reader reaches the
  closing section of the home page — after the opening screen, the four steps, the
  questions and the report outline. A discount for a product nobody has explained yet is
  not persuasion, it is an obstacle, and it must never open over the question list.
- **Nothing floats over content.** The campaign link row is `position: static` at the top
  of the page. It was `fixed`, which made it follow the reader down every page and sit on
  headings and body text; `absolute` stopped the following but landed it on the page's own
  header links, which axe reports as obscured targets. In the flow it overlaps nothing.
- Both remain dismissible and session-scoped, and both disappear with the campaign.

## 5. Guidance rules

**Guidance shows the screen; it does not describe it.** The composition is Naver's AI탭
walkthrough (`mkt.naver.com/aitab`): the instruction is a heading *above* the frame with one
concrete example under it — "양력 생년월일만 넣습니다 / 1994-11-04" — and the frame below holds
nothing but the screen, playing. One screen at a time, chosen by a step tablist.

The screens are **recordings of the running product**, made by
`scripts/capture-guide-screens.mjs` and committed under `public/images/guide/` as an H.264
MP4 plus its own first frame as a poster:

| Step | Recorded from |
| --- | --- |
| 01 질문 고르기 | `/ko` question list, scrolled and hovered |
| 02 생년월일 | `/ko/numerology` intake, the date typed and consent ticked |
| 03 무료 결과 | the free result the engine calculates for `1994-11-04`, scrolled |
| 04 상세 리딩 | `/ko/samples/detail`, the report the generator produces, scrolled |

Rules that keep the 실제 화면 label honest:

- **Re-run the recording script whenever any of those four screens changes visually.** A
  stale recording is the same lie as a hand-drawn one.
- **Nothing is cropped.** A screen taller than the frame is *scrolled* inside it, the way a
  visitor reads it, instead of being cut to fit. This is why these are clips and not stills:
  the earlier stills had to be cut on a measured element boundary, and one slice still lost
  a heading.
- Frames are grabbed as 2x screenshots and encoded at 20fps, not through Playwright's own
  video encoder — it never scales a page up, so it left the 390px page in the corner of a
  780px canvas. Each clip stays under ~1.3 MB.
- Recordings use the same birth date as `/samples`, so every published example agrees.
- Nothing may cover the picture: the label and the guidance sit above the frame, because
  here the picture is the product rather than scenery.
- **The walk walks.** The step changes when its clip ends — the screen's own length is the
  step's length — and the current tab carries the clip's progress so the change is never
  unexplained. A walkthrough that only moves when tapped is a stack of tabs, which is the
  thing this replaced. Tapping a tab still works and simply takes over from there.
- Clips are `muted`, `playsInline`, not looped (a loop would hold a step forever), and
  download nothing — poster included, since a poster is fetched whatever `preload` says —
  until the reader reaches the stage. Only the step being watched and the one it moves to
  next are fetched; nothing plays or advances while the stage is off screen; and a reader
  who asked for reduced motion is left the poster and the tabs.
- The stage holds no `<input>`, `<button>`, or link, so a preview never puts a dead control
  in the keyboard path.

## 6. Ink and ground

**Every screen states the ground its ink is standing on.** Two rules, both learned the hard
way on the free result:

- **A ground painted by an ancestor is not a licence to keep the other theme's ink.**
  `.webtoon-flow` paints a night ground and `.webtoon-adapt` deliberately leaves its blocks
  unpainted, so the free result's bands kept the light theme's near-black body text and put
  it on a near-black page — "탐색할 강점" at 2.35:1, its bullets at 2.14:1. Whichever of the
  two you set, set the other with it.
- **Measure the pixels, not the CSS.** `getComputedStyle().backgroundColor` reports
  `transparent` for every one of those blocks and reads the wrong ancestor's colour, so it
  cleared them all. The audit that found this makes the glyphs transparent, photographs the
  page a viewport at a time, and reads the ground under each box — see the Continuation
  State entry for the traps (`visibility: hidden` takes the element's own background with
  it; full-page capture re-lays out anything sized in viewport units; a closed `<details>`
  is still laid out; and the campaign popup will happily cover the page you are measuring).

The small label tones — `--muted` and `--clay` — are unit-tested to clear 4.5:1 on `--paper`,
`--paper-deep` and `--white`, because they carry eyebrows, kickers and disclaimers at 12–15px.

A screen labelled "실제 화면" that was drawn by hand would drift from the product the first
time either changed, and the label would quietly become a lie. Preview markup is also
**inert** — no `<input>`, `<button>`, or link inside it — so a preview never puts a dead
control in the keyboard path.

First-visit guidance is a nudge, never a gate.

- The guide itself stays on the page for everyone; only the one-line cue pointing at it is
  first-visit-only (`gyeol.guide.seen.v1` in `localStorage`).
- Never a modal on arrival, never a forced sequence, never a blocked interaction, never a
  second interruption for a returning visitor.
- A browser that refuses storage must degrade to showing the cue again — never to breaking.
- The reopen path ("이용 방법") stays in the header navigation and the guide keeps its own
  heading, so it is findable without the cue.

## 6. Free / detailed / premium

Each tier has a job, and the difference between them is never merely length.

| Tier | The question it answers |
| --- | --- |
| Free | 나는 어떤 사람인가? |
| 상세 리딩 | 내가 지금 고민하는 문제는 왜 반복되고 어떻게 읽어야 하는가? |
| 프리미엄 | 여러 영역이 어떻게 연결되어 있고, 지금 무엇을 점검해야 하는가? |

The free reading renders the opening slice of what the engine calculates
(`FREE_DOMAIN_COUNT`, `FREE_CAREER_COUNT`, `FREE_STRENGTH_COUNT` in
`src/components/onboarding-experience.tsx`) and names the remainder. The engines keep
calculating everything: only what is rendered is limited, so the paid reports are unaffected.
