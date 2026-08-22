import { expect, test } from "@playwright/test";
import { resolvePublicAppUrl } from "../../src/core/site-url";

const cases = [
  {
    locale: "ko",
    title: "결 GYEOL | 사주·수비학으로 보는 나·관계·운세",
    description:
      "생년월일 기반 사주와 수비학을 서로 분리해 성향·관계·운세의 흐름을 정리하는 상징적 자기 성찰 리딩 서비스.",
    openGraphLocale: "ko_KR",
  },
  {
    locale: "en",
    title: "GYEOL | Saju, Numerology & Daily Flow",
    description:
      "Separate Saju and Numerology experiences for symbolic reflection on personality, relationships, and daily or yearly flow.",
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
      /GYEOL/,
    );
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute("content", "image/png");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  });
}
