import { expect, test } from "@playwright/test";

const cases = [
  {
    locale: "ko",
    title: "InnerArc | 당신의 삶에 반복되는 결",
    description:
      "생년월일과 현재의 고민을 바탕으로 성향·관계·직업·재물에서 반복되는 패턴을 구체적으로 분석하는 자기이해 서비스.",
    openGraphLocale: "ko_KR",
  },
  {
    locale: "en",
    title: "InnerArc | The Patterns That Repeat in Your Life",
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

    const pageOrigin = new URL(page.url()).origin;
    const openGraphImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute("content");
    expect(openGraphImage).toBeTruthy();
    expect(twitterImage).toBeTruthy();

    for (const imageUrl of [openGraphImage!, twitterImage!]) {
      const parsed = new URL(imageUrl);
      expect(parsed.origin).toBe(pageOrigin);
      expect([...parsed.searchParams.keys()]).not.toEqual(
        expect.arrayContaining(["birthDate", "name", "question", "relationship"]),
      );
      const imageResponse = await request.get(imageUrl);
      expect(imageResponse.ok()).toBe(true);
      expect(imageResponse.headers()["content-type"]).toContain("image/png");
      const image = await imageResponse.body();
      expect(image.readUInt32BE(16)).toBe(1200);
      expect(image.readUInt32BE(20)).toBe(630);
    }

    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      "content",
      /InnerArc/,
    );
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute("content", "image/png");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  });
}
