# Detailed / Premium price revision — 2026-10-27

## Scope and source evidence

The owner explicitly requested Detailed 9,800 KRW and Premium 36,000 KRW. This is an
owner-directed price change, not measured demand elasticity or a profitability claim.
Latest main/source and live deployment before editing: `cb1f5261458ed935d8ed97e3ca5e8925f3b4166b`,
CI 40319130784, Deploy 40321757570, Worker `e6e8f37b-3f59-4881-a2f3-88fe1883bba3`.
Live site/database were healthy and payments open. Primary checkout's unrelated dirty
protection/privacy files remain untouched; reuse the clean recovery worktree.

## Catalog and purchase boundaries

At 2026-10-27 00:00 Asia/Seoul the server schedule changes Detailed `pro_30d` from
39,000 to 9,800 and Premium `premium_pdf` from 79,000 to 36,000. Chart `plus_30d` stays
5,500. Past schedule snapshots, retired 9,600/39,000 and 1,500 campaign evidence, and
pre-revision 39,000/79,000 assertions remain accepted for compatibility, but cannot
choose a new checkout amount. Existing provider variables are optional assertions;
recognized old values keep readiness open while actual prices come only from code.
Unknown assertions still fail closed. A stale or tampered expected amount returns
`409 PRICE_CHANGED` before any order/provider write; stored orders and callbacks use
their original amounts, never the new list price.

Distribution remains the existing home/reading guide, KO/EN/JA plans, Saju hub and
Japanese intake. The latter now receives a server snapshot instead of handwritten prices.
Existing dynamic product cards/FAQ stay on the same snapshot. New report badges use the
revised price. Stored reports, invoices, prior purchase amounts, content, tier IDs with
legacy numeric suffixes, section-plan versions, entitlements, download/access and refund
behavior are preserved; no automatic past refund, regeneration, migration or new data.
Expired campaign pages/terms remain historical campaign evidence, not a new offer.
The expired September referral validity and coupon terms are not revived or changed.

## Unit economics and claims

Gross list receipt changes: Detailed -29,200 KRW (-74.9%) and Premium -43,000 KRW (-54.4%).
Compared with the earlier 9,600/39,000 reference, receipts change +200/-3,000 KRW.
Generation is existing deterministic code with no new AI/model/token/API/subscription
or fulfillment process. Hosting, payment-provider fees, tax, refunds, chargebacks and
support remain real costs; exact contracted per-order fees and contribution margin are
unverified, so do not assert margin or invent fee percentages. Net contribution equals
actual receipts less those actual costs. The lower prices must not weaken paid depth,
calculation evidence or symbolic-reflection/professional-help boundaries.

Use existing consented aggregate product-select/payment-success/report-open signals and
support/refund feedback, without new collection, to assess completion and contribution.
Guardrails: zero displayed/charged mismatch; unchanged purchased access and fulfillment;
no safety/accessibility regression; no increase in delivery failures, refunds or abuse.
Pause sales on a mismatch; revisit pricing if actual per-order contribution is negative
or support/refund cost rises. No invented conversion lift or prediction accuracy.

## Validation and reversal

Four synthetic price-revision tests failed before implementation, reproducing the missing
revision and old/new assertion mismatch. Focused checks now cover exact KST boundary,
old campaign comparison, accepted revision evidence, invalid assertion rejection, real
order creation/provider request parity, and stale/tampered rejection without writes.
PayApp callback regressions cover new 9,800/36,000 and historical 39,000/79,000/9,600/1,500
amounts against the saved order, retaining existing forged/wrong-amount rejection tests.
Old diagnostic fixtures initially compared an August clock with the current catalog;
fix their intended current-price clock, retain explicit historical schedule tests.
The first new browser guide selector targeted the retired guide, which the current Harang homepage and `/reading` do not mount. Stop those invalid checks and exercise the actual home payment FAQ and Saju entry instead, without changing product navigation or claiming the failed attempts passed.
New browser checks cover all three locale plan cards, Japanese intake, actual home FAQ and Saju
entry; existing isolated fake checkout now asserts exact catalog request amounts.
No real provider payment or customer-record query is used for QA.

Require lint/typecheck/unit/report-quality, production builds, normal CI/browser/fake
checkout, and post-deploy public price/health checks. Final identities/results live in
the PR release evidence and ignored `artifacts/report-pricing-2026-10-27/` to avoid a
second documentation-only CI/deploy. Physical-device and real-money settlement are not claimed.

Rollback source/Worker above is preserved before payment changes. Reverse the current
price revision through normal CI/deploy while retaining every authorized historical
amount in assertion compatibility and preserving Worker variables with `--keep-vars`.
Do not update saved order amounts or reports; no data rollback is needed.

Local Node 24 evidence: 136 unit files / 1,442 checks, including 12 report-quality files /
311 checks, passed; lint 0 errors / four existing navigation warnings; typecheck, Next
production build and actual Vinext build/style gate passed. Ten installed-Chrome
desktop/mobile-emulation public pricing checks and eight isolated fake-checkout checks
passed after correcting the retired-guide selector; no retries. Audit exits successfully
with two existing ignored high advisories unchanged. Hosted CI/deployment/live checks
remain required; local success alone is not a release.
