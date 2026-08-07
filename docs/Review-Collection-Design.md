# Review collection

Before this change the site had no way for a buyer to say anything back. The only
evidence on the storefront was the seller's own copy, and the only feedback channel was
a support inquiry — a form for problems, not for what worked.

There was no existing review, testimonial, or order-feedback system to preserve, so this
is the smallest workflow that fits the architecture already here: guest-first purchases,
proof-of-access instead of accounts, service-role-only tables, and one owner console.

## What a review is

Four questions, asked once, on a reading the person has actually opened:

1. What did you want to understand?
2. What felt most useful or most specific?
3. Was anything hard to understand? (optional)
4. Did the reading change an action you had planned?

Question 4 is the only one that measures anything. It is stored as one of `changed`,
`considering`, `unchanged`, or `too_early`, and it is counted — never averaged into a
star rating, because four questions cannot carry one and an invented score is the first
thing that makes evidence untrue.

## Who may write one

`authorizeReviewForOrder` (`src/server/reviews.ts`) reuses `getAuthorizedStoredReport`,
the exact check the report page runs. A review is accepted only when the caller can
already open the report it is about, proven by one of:

- the guest access token in the report link,
- the signed return ticket from the payment provider,
- the `gyeol_pass` order-pass cookie this server issued,
- the order-number-plus-phone lookup proof, or
- account ownership for a signed-in buyer.

The stored report must also be `ready`. A reading still waiting on payment, one that
failed to build, or one revoked after a refund is not something anybody has read.

Every write endpoint additionally refuses cross-origin requests, and the unique
`order_id` index means one order can carry exactly one review.

## The label it carries

`resolveReviewType` decides the label from the verified order, never from the form:

| Order state | Label |
| --- | --- |
| `DONE`, amount > 0 | `verified_purchaser` |
| `DONE`, amount = 0 | `free_reading` |
| anything else | refused — no review is stored |

`beta_participant` is the one label an operator can set by hand in the console, because
only the owner knows who tested before launch. The submission schema has no
`reviewType` field at all, so a visitor cannot ask to be called a verified purchaser.

## Consent, separated

Submitting feedback and agreeing to publish it are two different decisions and two
different columns. `public_consent` defaults to false: a review that says nothing about
consent is private feedback for the owner and never reaches a public page.

With consent given, the reviewer also chooses:

- a **display name** — a preset anonymous option or a short nickname, held to letters,
  digits, spaces and `. _ -`, with any run of four or more digits rejected, so a phone
  number, an email address, or a birth year cannot be stored as a name; blank renders
  as "익명 / Anonymous";
- whether to **hide their product and situation** — with this on, the public projection
  drops the product name and their answer to question 1.

Consent is revocable from the same report page, at any time, through
`POST /api/reviews/consent`. Withdrawal sets `public_consent` false and the status to
`withdrawn`, and because the public projection requires both an approval *and* a live
consent flag, the review disappears on the next render. Granting consent again returns
the review to the moderation queue rather than restoring the earlier approval.

## Approval, always by a person

`saveReview` writes `status: 'pending'` and has no argument that can write anything
else. The only endpoint that can write `approved` is
`POST /api/admin/reviews/[id]`, behind the same Supabase sign-in and `ADMIN_EMAILS`
allowlist as the rest of the console. Nothing auto-publishes, and no review record was
seeded or fabricated.

`toPublicReview` is the single gate to a public surface. It returns null unless the
review is approved and still consented, and it projects onto a separate type that has no
field for the order number, the operator note, or a timestamp finer than the month.

## What is never collected

The form asks four questions and nothing else. The table has no column for a birth
date, the concern free-text from checkout, a payment key, a phone number, an amount, or
any report content — so none of it can leak through a review. Reviewer answers are free
text and are moderated by a person before anything is published.

## Storage

`supabase/migrations/20260803000100_review_collection.sql` creates one new table,
`public.product_reviews`. It alters no existing table, adds no foreign key into
`payment_orders` (the order number is copied in as plain text and the association is
proven in application code), enables row-level security, and grants only `service_role`.

Reversal is a single `drop table public.product_reviews;`, written out at the bottom of
the migration file. Because nothing existing is modified, rolling back cannot lose
customer, order, payment, or report data.

Every read path answers `available: false` instead of throwing when the table is
missing, so a deployment running ahead of the migration keeps a working home page,
report page, and console — the review UI simply does not appear.

## When there are no reviews

`ReviewEvidenceSection` renders no empty cards and no "coming soon" line. With nothing
approved it shows what the product actually contains, how the reading is built, what it
does not do, and the questions buyers ask. That section states plainly that reviews are
not invented, and the FAQ describes this collection process.

## Live broadcast chat is a separate thing

The operator runs live 사주·타로 readings and viewers reply in the platform's chat. Some
of those replies are the strongest thing anyone has said about the readings, and they are
real, so they are shown — but they are not reviews of a purchased report, and the site
never presents them as if they were.

They live in `src/core/reviews/live-reactions.ts`, which `src/core/reviews/index.ts`
deliberately does not re-export. Nothing in the review pipeline reads that file: it does
not become a `PublicReview`, it is not counted by `summarizeReviewOutcomes`, it never
appears in the operator console, and the review count on the page is unaffected by it.

`ReviewEvidenceSection` renders it in its own `<section>`, after whichever review block
applied, under a heading and an intro that say where the words came from before showing
any of them, and above a closing line that states the boundary again. It renders in both
states — with and without approved reviews — because its truth does not depend on theirs.

The bubbles drift sideways on their own rather than waiting below the fold: two identical
tracks run end to end inside a clipped, edge-faded strip and each slides exactly one track
width, so the seam never shows. The duplicate is `aria-hidden`, so a screen reader hears
each line once. The row pauses on hover and on focus, and under
`prefers-reduced-motion: reduce` it does not move at all — it becomes an ordinary
swipeable strip and the duplicate track is removed. Nothing in the block is revealed by
scrolling; scroll-driven reveal is reserved for the report, where a reader has already
paid to be led through something.

Rules the list follows:

- Verbatim from broadcast captures the operator kept, typos and trailing dots included.
- Pseudonymous handles exactly as the platform displayed them; no real name, no photo,
  no contact detail, nothing that reaches a person. Where the capture showed no handle,
  the entry reads 익명.
- The Korean original is shown on both locales. The English gloss appears beside it,
  never in place of it, so a reader always sees what was actually typed.
- Bare agreements ("맞아요", "네~") were left out: alone they carry nothing a visitor can
  weigh, and padding the list with them would be volume for its own sake.
- No line claims a result, a price, or a guarantee. `tests/unit/reviews.test.ts` asserts
  each of these properties, including that the block sits outside both review renderers.

Adding to the list means adding a broadcast capture to the operator's own records first.
Nothing goes in that was written for the website.
