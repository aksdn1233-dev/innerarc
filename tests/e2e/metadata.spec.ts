import { expect, test } from "@playwright/test";
import { resolvePublicAppUrl } from "../../src/core/site-url";

const cases = [
  {
    locale: "ko",
    title: "태령당 | 실제 삶으로 검증하는 개인 패턴 분석",
    description:
      "생년월일 기반 상징 분석을 가설로 제시하고, Reality Check와 실제 삶의 기록으로 시간이 갈수록 나를 더 정확하게 이해하는 개인 패턴 분석 시스템입니다.",
    openGraphLocale: "ko_KR",
  },
  {
    locale: "en",
    title: "태령당 | Personal Pattern Intelligence",
    description:
      "A personal pattern intelligence system that keeps deterministic symbolic analysis separate from lived-experience feedback, evidence, and uncertainty.",
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
      /태령당/,
    );
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute("content", "image/png");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  });
}
