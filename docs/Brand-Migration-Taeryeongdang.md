# 태령당 brand migration

## Current decision

- Approved Korean public name: `태령당`.
- Product descriptor: `Personal Pattern Intelligence`.
- `TAERYEONGDANG_INTERNAL` is code-only and must never be shown to customers.
- `mygyeol.kr` remains the production origin. No replacement domain is confirmed, so this change does not alter DNS, the Cloudflare custom-domain route, canonical origin, callbacks, payment return URLs, sitemap host, or Search Console property.
- `결 GYEOL`, `MY GYEOL`, `My Gyeol`, and `마이결` remain legacy search aliases during the transition. Ordinary Korean uses of `결` remain untouched.

## Implemented surfaces

Central brand configuration now supplies the approved public name, descriptor, current production origin, and legacy aliases. Root/localized metadata, Open Graph/X copy, JSON-LD, manifest, headers, legal pages, share/export filenames, payment memo, purchased-report cover, and main product navigation use `태령당`. A new 1200×630 first-party social card contains the approved name and product-positioning copy.

Internal compatibility identifiers such as package name `innerarc`, storage/cookie keys, database table names, Worker name, and the current domain are intentionally unchanged. Renaming them would invalidate saved browser data, callbacks, deployment bindings, or production routing without customer benefit.

## Future domain cutover plan (not executed)

1. Confirm ownership, legal review, TLS, email, payment callbacks, and Supabase redirect allowlists for a replacement domain.
2. Build with the new path-free HTTPS origin; verify canonical, hreflang, Open Graph/X, JSON-LD, sitemap, image sitemap, manifest, auth callback, payment callback, and report links.
3. Keep `mygyeol.kr` as a permanent path-preserving 301 redirect after a monitored overlap window; never redirect private bearer-token URLs through third parties.
4. Add and verify the new Search Console/Naver properties, submit both sitemaps, monitor indexing and 404s, then change the preferred property only after evidence.
5. Preserve a rollback route to `mygyeol.kr` until auth, checkout, reports, and search discovery pass production probes.
