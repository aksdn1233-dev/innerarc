import { expect, test } from "@playwright/test";
import { resolvePublicAppUrl } from "../../src/core/site-url";

const cases = [
  {
    locale: "ko",
    title: "결 GYEOL | 프리미엄 타로·신점 상담",
    description:
      "타로의 상징과 현재의 고민을 연결해 연애·관계·진로·재물의 흐름을 깊고 구체적으로 읽는 프리미엄 타로신점 서비스.",
    openGraphLocale: "ko_KR",
  },
  {
    locale: "en",
    title: "GYEOL | Premium Tarot Reading",
    description:
      "A premium self-understanding service for exploring recurring patterns across self, relationships, work, and money.",
    openGraphLocale: "en_US",
  },
] as const;

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
      /GYEOL/,
    );
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute("content", "image/png");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  });
}
