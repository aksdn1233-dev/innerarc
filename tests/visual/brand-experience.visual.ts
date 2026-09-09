import { expect, test } from "@playwright/test";

const widths = [360, 390, 430, 768, 1024, 1280, 1440] as const;

async function capture(page: import("@playwright/test").Page, selector: string, name: string) {
  const subject = page.locator(selector);
  await subject.scrollIntoViewIfNeeded();
  await subject.locator("img").evaluateAll(async (images) => {
    await Promise.all(images.map((node) => {
      const image = node as HTMLImageElement;
      return image.complete ? Promise.resolve() : new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }));
  });
  await page.evaluate(async (hideHeader) => {
    document.querySelector<HTMLElement>(".skip-link")?.style.setProperty("display", "none", "important");
    document.querySelector<HTMLElement>(".td2-nav-shell")?.style.setProperty("visibility", hideHeader ? "hidden" : "visible", "important");
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }, !selector.includes("td2-hero") && !selector.includes("td2-walkthrough"));
  const screenshot = await subject.screenshot({ animations: "disabled" });
  expect(screenshot).toMatchSnapshot(name, { threshold: .1, maxDiffPixelRatio: .001 });
  await page.evaluate(() => document.querySelector<HTMLElement>(".td2-nav-shell")?.style.removeProperty("visibility"));
}

async function openHome(page: import("@playwright/test").Page) {
  await page.goto("/ko", { waitUntil: "networkidle" });
  await expect(page.getByRole("dialog", { name: "결과를 보는 방법부터 알려드릴게요." })).toBeVisible();
}

test.describe("Taeryeong Daily Healing homepage", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-space", "One deterministic Chromium capture set is sufficient.");
  });

  for (const width of widths) {
    test(`daily healing layout at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width <= 430 ? 844 : width < 1000 ? 900 : 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await openHome(page);

      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await capture(page, ".td2-walkthrough", `brand-${width}-guide.png`);
      await page.getByRole("button", { name: "안내 닫기" }).click({ force: true });
      await expect(page.getByRole("heading", { level: 1, name: "사람의 흐름을 읽어 더 나은 오늘을 만듭니다." })).toBeVisible();
      await capture(page, ".td2-hero", `brand-${width}-hero.png`);

      const heroQuality = await page.locator(".td2-hero-image").evaluate(async (node) => {
        const image = node as HTMLImageElement;
        const box = image.getBoundingClientRect();
        const response = await fetch(image.currentSrc);
        const bitmap = await createImageBitmap(await response.blob());
        const density = bitmap.width / box.width;
        bitmap.close();
        return { density, transform: getComputedStyle(image).transform };
      });
      expect(heroQuality.density).toBeGreaterThanOrEqual(1);
      expect(heroQuality.transform).toBe("none");

      await capture(page, ".dh-concerns", `daily-${width}-concerns.png`);
      await capture(page, ".dh-listening", `daily-${width}-listening.png`);
      await capture(page, ".dh-services", `daily-${width}-services.png`);
      await capture(page, ".dh-reality", `daily-${width}-reality.png`);
      await capture(page, ".dh-report", `daily-${width}-report.png`);
      await capture(page, ".dh-space", `daily-${width}-space.png`);
      await capture(page, ".dh-close", `daily-${width}-closing.png`);

      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      expect(errors).toEqual([]);
    });
  }

  test("real routes, selection, content truth, and media quality", async ({ page, request }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page);
    await page.getByRole("button", { name: "안내 닫기" }).click({ force: true });

    const flow = page.locator(".dh-flow");
    await expect(flow.getByRole("heading", { name: "오늘, 어떤 고민이 있으신가요?" })).toBeVisible();
    await expect(page.locator(".dh-concern-grid button")).toHaveCount(6);
    await page.getByRole("button", { name: /연애·관계/ }).click();
    await expect(page.getByRole("button", { name: /연애·관계/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("link", { name: /이 고민부터 살펴보기/ })).toHaveAttribute("href", "/ko/numerology?focus=relationships");

    await expect(page.locator(".dh-guide-strip article")).toHaveCount(6);
    await expect(page.locator(".dh-service-grid > a")).toHaveCount(6);
    await expect(page.locator(".dh-reality > ol li")).toHaveCount(5);
    await expect(page.locator(".dh-celestial-thread circle")).toHaveCount(0);
    await expect(flow).not.toContainText("타로");
    await expect(flow).not.toContainText(/120만|98%|★★★★★/);

    const servicePaths = await page.locator(".dh-service-grid > a").evaluateAll((links) => links.map((link) => new URL((link as HTMLAnchorElement).href).pathname));
    expect(servicePaths).toEqual([
      "/ko/fortune",
      "/ko/numerology",
      "/ko/compatibility",
      "/ko/daily-fortune",
      "/ko/reality-check",
      "/ko/space",
    ]);
    const routeResponses = await Promise.all(servicePaths.map((path) => request.get(path)));
    routeResponses.forEach((response, index) => expect(response.status(), servicePaths[index]).toBeLessThan(400));

    const media = page.locator(".dh-listening img, .dh-guide-strip img, .dh-space img");
    for (let index = 0; index < await media.count(); index += 1) {
      const image = media.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty("complete", true);
      expect(await image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    const imageQuality = await media.evaluateAll(async (images) => Promise.all(images.map(async (node) => {
      const image = node as HTMLImageElement;
      const box = image.getBoundingClientRect();
      const response = await fetch(image.currentSrc);
      const bitmap = await createImageBitmap(await response.blob());
      const density = bitmap.width / box.width;
      bitmap.close();
      return { density, loaded: image.complete && image.naturalWidth > 0 };
    })));
    for (const item of imageQuality) {
      expect(item.loaded).toBe(true);
      expect(item.density).toBeGreaterThanOrEqual(1);
    }

    await expect(page.locator(".dh-report-paper")).toContainText("18 CHAPTERS");
    await expect(page.locator(".dh-report-paper")).toContainText("핵심 숫자");
    await expect(page.locator(".dh-report-paper")).toContainText("지금 해볼 한 가지");
  });
});
