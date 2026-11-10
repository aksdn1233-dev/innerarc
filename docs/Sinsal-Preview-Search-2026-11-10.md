# Expanded traditional markers and search discovery — 2026-11-10

Owner asked for more useful 신살, a directly visible free/detail/premium comparison,
and removal of stale search results. The current rules remain versioned and reproducible.
Add 화개 (day-branch 삼합: 申子辰→辰, 寅午戌→戌, 巳酉丑→丑, 亥卯未→未),
괴강 (day pillars 庚辰 庚戌 壬辰 壬戌), and 천을귀인 (day-stem table 甲戊庚→丑未,
乙己→子申, 丙丁→亥酉, 壬癸→卯巳, 辛→寅午). Other schools differ, especially for
괴강 and 庚 천을. The result identifies its exact convention and does not assert
outcomes, diagnosis, personality, luck or future certainty. Unknown birth hour stays
unverified. No live user facts, external AI, new provider, cost or data collection.

Compare `/ko/samples/sinsal`: three labelled, non-indexed, synthetic 1994-11-04
examples derived from the actual free calculator and paid-report factory. Links lead to
the full existing product screens. The example is not a real paid order, and paid content
continues to require existing payment/authorization. Existing saved purchases retain
original results; new reports use `sinsal:1.1.0`. Prices, deterministic Saju engine,
authentication, payment, account isolation and storage are unchanged.

Sources for alternative conventions:
https://www.dk-saju.com/sinsal/%EA%B4%B4%EA%B0%95%EC%82%B4
https://gyeop.kr/sinsal/cheoneul
https://smithlab.co.kr/posts/saju/yeokmasal-hwagaesal-hongyeomsal/

Search review: current `https://mygyeol.kr/ko` returns a self-canonical and the public
sitemap is already submitted successfully in Google Search Console; it was last read
2026-11-06. The separate old `innerarc-gyeol.qkrehgus5886.chatgpt.site/ko` still serves
old HTML but already declares the current canonical. A canonical is a hint, not immediate
removal or proof of index state. Google and Naver decide recrawl/index timing; use the
verified console property to request recrawl only after actual deployment. Naver Search
Advisor requires its own authenticated session. Do not claim that an older URL has been
removed without a search-console result. Do not blanket-noindex the new canonical or
block crawling of URLs that need removal. Sitemap previously claimed every URL was
modified at the instant the sitemap was requested; omit unverifiable `<lastmod>` rather
than give misleading freshness signals. Private sample/results remain noindex.

The owner directly requested discovery and feature expansion. Current distribution and
5,500/9,800/36,000 KRW prices/fulfillment economics remain unchanged. Monitor report
completion and support feedback; a matched symbol is not an accuracy metric. Rollback:
revert this code through normal CI and keep user records, existing audit fixes and
payment settings. Pre-change source f79a8d49998fea4dc3d66c96aec8a18ad0057dec / Worker
5751dec0-ed20-4eba-8276-ec22067de31d. Final checks, CI and any deployment status belong
in the PR; do not redeploy solely to write a run number.

Local validation: 1,506 unit checks, 327 report quality checks, 60 focused marker and
search checks, lint (zero errors / four existing navigation warnings), typecheck and
both Next and Vinext builds passed. Ten desktop/mobile-emulated browser checks passed;
the 390px comparison was visually inspected. No real purchases or user data were used.
Google Search Console domain property already has the public sitemap; Naver login was
not available in the browser. The old Sites deployment is independently hosted; do
not overwrite or remove private routes in the name of de-indexing.

Naver IndexNow: public verification file `/2b3cd289b4b5df14685c1db46e679a37.txt` intentionally contains
its filename key, as the official protocol requires. After deployment verify the file,
then submit only the changed canonical public URLs to Naver. This key is public by design
and authorizes URL update notifications, not site access. Record the HTTP result; 200/202
is acceptance of a notification, not proof of indexing or old-result removal.
https://searchadvisor.naver.com/guide/indexnow-request

Legacy host follow-through: separately hosted Site version 112 (source
`933d68971cafa677c9bc72726a84efd1e4010de5`) deploy succeeded. Public GET/HEAD
allowlisted pages now issue a 301 to the equivalent current-site URL; OAuth,
existing private report/order/account/payment/API paths, token-bearing links and
writes remain on the old host. Sixteen tests, typecheck, production build and live
checks confirmed `/ko` → `https://mygyeol.kr/ko` and the existing order-lookup page
still returns 200. Saved Site version 111 is the rollback. Results still depend on
search-engine recrawl; do not claim old search listings are already gone.
