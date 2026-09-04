import { expect, test } from "@playwright/test";
import { resolvePublicAppUrl } from "../../src/core/site-url";
import { getLocalizedSiteMetadata } from "../../src/i18n/site-metadata";

/*
 * What this test is about is the plumbing: that whatever the copy says reaches the title,
 * the description, the Open Graph and Twitter tags, and the Naver ownership proof, on both
 * locales. It used to restate every string, so rewriting a sentence for readers meant
 * editing the test that guards it — which teaches a maintainer to edit tests to make them
 * pass. The copy is read from where the site reads it; whether that copy is any good is
 * checked in tests/unit/search-presence.test.ts.
 */
const cases = (["ko", "en"] as const).map((locale) => {
  const copy = getLocalizedSiteMetadata(locale);
  return { locale, title: copy.title, description: copy.description, openGraphLocale: copy.openGraphLocale };
});

for (const expected of cases) {
  test(`${expected.locale} links expose native first-party preview metadata`, async ({ page, request }) => {
    await page.goto(`/${expected.locale}`);

    await expect(page).toHaveTitle(expected.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", expected.description);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", expected.title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      "content",
      expected.description,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      expected.openGraphLocale,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", expected.title);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute(
      "content",
      expected.description,
    );
    await expect(page.locator('meta[name="naver-site-verification"]')).toHaveAttribute(
      "content",
      "7e543b74b6a17ebc6418e21aaf86beffd07b9614",
    );

    const canonicalOrigin = resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL).origin;
    const openGraphImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute("content");
    expect(openGraphImage).toBeTruthy();
    expect(twitterImage).toBeTruthy();

    for (const imageUrl of [openGraphImage!, twitterImage!]) {
      const parsed = new URL(imageUrl);
      expect(parsed.origin).toBe(canonicalOrigin);
      expect([...parsed.searchParams.keys()]).not.toEqual(
        expect.arrayContaining(["birthDate", "name", "question", "relationship"]),
      );
      const imageResponse = await request.get(parsed.pathname);
      expect(imageResponse.ok()).toBe(true);
      expect(imageResponse.headers()["content-type"]).toContain("image/png");
      const image = await imageResponse.body();
      expect(image.readUInt32BE(16)).toBe(1200);
      expect(image.readUInt32BE(20)).toBe(630);
    }

    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      "content",
      /태령당/,
    );
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute("content", "image/png");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  });
}
