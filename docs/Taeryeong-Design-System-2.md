# 태령당 Design System 2.0 — editorial product presentation

Date: 2026-09-08
Scope: public home presentation and the shared visual direction for product introductions. Existing calculation, report, auth, payment, privacy, data-rights, and deployment contracts remain authoritative.

## Acceptance criteria

- The first screen states what 태령당 does in readable Korean, offers a free deterministic entry, and does not present symbolic systems as scientific prediction.
- The landing sequence connects self analysis, public-figure comparison, relationship analysis, Space Intelligence, and Reality Check with links to the existing routes.
- Product evidence is real: the personal preview follows the shipped deterministic result structure, the public-figure preview uses an existing sourced case, and Space uses screenshots captured from the real WebGL renderer.
- Generated hero art is decorative, carries no result claim, contains no text or personal data, and is visibly disclosed as a generated brand scene.
- `SPACE_ENABLED` still controls the Space navigation, pillar, and showcase. With the flag off, existing routes and the rest of the home remain intact.
- Korean and English pages preserve equivalent meaning. Lines use `word-break: keep-all`; headings have authored semantic breaks and remain readable at 390, 430, 768, 1024, and 1440 pixels.
- Every standalone action is at least 44 by 44 CSS pixels. There is no horizontal document overflow. Reduced-motion and increased-contrast preferences have explicit styles.
- The public footer retains the symbolic-reflection boundary and the locale layout continues to apply the global Level B content-protection notice.
- No checkout amount, entitlement, account rule, calculation, storage contract, AI-provider call, database schema, or deployment configuration changes in this pass.

## Tokens

| Family | Values | Use |
|---|---|---|
| Typography | system Korean serif display; system Korean sans body | editorial statements and readable interface copy without redistributed font files |
| Paper | `#fbfaf7`, `#f7f4ef` | calm main ground and section continuity |
| Mist | `#edf1f6` | Space Intelligence environment |
| Blush / lavender | `#f3e9e8`, `#eeeaf3` | relationship and comparison chapters |
| Ink / navy | `#171828`, `#151425` | text, primary actions, and Reality Check |
| Line | 12% ink | editorial division without nested cards |
| Radius | 18–32px product frames; 999px primary actions | product screenshots and clear actions only |
| Shadow | `0 22px 70px rgba(31,30,48,.10)` | real product frames, not every content block |
| Content | 1360px editorial grid; 28px desktop and 20–22px mobile gutters | long-form composition |
| Motion | 220–250ms transform/color; disabled under reduced motion | small action response only |

## Layout and component rules

- Navigation: brand, six direct destinations at most, purchase recovery, one primary start action, and language. Below 1180px the destinations become a horizontally scrollable second row with hidden scrollbars and no document overflow.
- Headings use large sentence-shaped typography, short paragraphs, and generous vertical spacing. Avoid faux dashboards and repeated badges.
- Product previews show one dominant frame per chapter. Use fine dividers and background changes for hierarchy. Never invent a customer result or efficacy claim.
- One small 태령 guide appears only beside the Space explanation. It does not occupy hero scale or replace product evidence.
- Forms and result pages retain their existing accessible controls and data flow. Future shell work should consume these tokens route by route instead of changing all legacy pages in one global CSS rewrite.
- Space keeps the real-render label and before/after camera parity. Marketing screenshots must come from the renderer and cannot be enlarged substitutes for the scene.

## Responsive evidence matrix

The visual suite captures hero, service map, personal preview, success/relationship, Space, and Reality Check at 390, 430, 768, 1024, and 1440 pixels. The functional regression also checks 320, 360, 375, 390, and 430 pixels for document overflow and 44-pixel targets.

## Provisional visual review

Scores are internal review aids based on the generated 2026-09-08 application captures. They do not replace owner approval.

| Category | Score | Evidence |
|---|---:|---|
| Typography | 9.1 | authored Korean breaks, quiet serif display, sans interface labels |
| Layout | 9.0 | clear editorial sequence and alternating full-width chapters |
| Whitespace | 9.1 | 82–168px section rhythm with restrained density |
| Premium feel | 9.0 | original hero art, real product frames, controlled surfaces |
| Brand coherence | 8.9 | East Asian editorial atmosphere with existing 태령 identity |
| Korean readability | 9.1 | keep-all wrapping, short paragraphs, five viewport checks |
| Product storytelling | 9.2 | self → comparison → relationship → space → lived evidence |
| Mobile quality | 8.8 | stacked comparisons, 44px actions, zero horizontal overflow |
| Depth | 8.8 | restrained shadows, layered mist, real 3D scene evidence |
| Interaction quality | 8.6 | direct route actions and responsive states; richer section motion intentionally deferred |

Overall: **8.96/10**. Lowest category: **8.6/10**. The result clears the requested 8.5 implementation threshold. Final acceptance remains the owner's decision from the actual captures.

## Hostile template audit

- No gradient headline, fake metric, floating emoji, testimonial fabrication, or repeated glass-card grid.
- Section backgrounds carry hierarchy; cards are reserved for actual report/room evidence.
- The hero is brand art with an explicit generated-image note, not a stock lifestyle claim or product-result simulation.
- The five product pillars use one numbered editorial index. They do not repeat icon/title/body/button microcards.
- Space and public-figure examples identify their evidence type and preserve uncertainty language.

## Rollback

Revert the landing route to `HomeExperience` and remove `taeryeong-landing.tsx`, its route-scoped stylesheet, and the new brand/Space preview images. This requires no migration or data rewrite. Keep the existing Space feature flags and all account-rights/cleanup code unchanged.
