import { expect, test } from "@playwright/test";
import axe from "axe-core";

type AxeViolation = {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical" | null;
  help: string;
  nodes: Array<{ target: string[]; failureSummary?: string }>;
};

const routes = [
  "/ko",
  "/ko/profile",
  "/ko/me",
  "/ko/privacy",
  "/ko/terms",
  "/ko/question",
  "/ko/relationship",
  "/ko/compatibility",
  "/ko/celebrity",
  "/ko/reality-check",
  "/ko/shop",
  "/en",
  "/en/profile",
  "/en/me",
  "/en/privacy",
  "/en/terms",
  "/en/question",
  "/en/relationship",
  "/en/compatibility",
  "/en/celebrity",
  "/en/reality-check",
  "/en/shop",
] as const;

for (const route of routes) {
  test(`${route} has no serious automated accessibility violation`, async ({ page }) => {
    await page.goto(route);
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const browserAxe = (window as typeof window & {
        axe: { run: (context: Document, options: object) => Promise<{ violations: AxeViolation[] }> };
      }).axe;
      const result = await browserAxe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
      });
      return result.violations.filter(({ impact }) => impact === "critical" || impact === "serious");
    });
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
}

test("outcome-informed relationship layer has no serious accessibility violation", async ({ page }) => {
  await page.goto("/en/relationship");
  await page.locator("#relationship-birth-date").fill("1994-11-04");
  await page.getByRole("button", { name: "Show my romantic pattern" }).click();
  await page.getByRole("button", { name: "Use saved relationship outcomes" }).click();
  await expect(page.locator("#relationship-outcome-context")).toBeFocused();
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => {
    const browserAxe = (window as typeof window & {
      axe: { run: (context: Element, options: object) => Promise<{ violations: AxeViolation[] }> };
    }).axe;
    const context = document.querySelector("#relationship-outcome-context");
    if (!context) throw new Error("Outcome context was not rendered");
    const result = await browserAxe.run(context, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
    });
    return result.violations.filter(({ impact }) => impact === "critical" || impact === "serious");
  });
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
});

test("relationship-to-Reality-Check prefill has no serious accessibility violation", async ({ page }) => {
  await page.goto("/en/relationship");
  await page.locator("#relationship-birth-date").fill("1994-11-04");
  await page.getByRole("button", { name: "Show my romantic pattern" }).click();
  await page.locator(".context-handoff").first().click();
  await expect(page.getByText(
    "Your selected relationship setting was loaded as a one-time draft.",
  )).toBeVisible();
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => {
    const browserAxe = (window as typeof window & {
      axe: { run: (context: Element, options: object) => Promise<{ violations: AxeViolation[] }> };
    }).axe;
    const context = document.querySelector(".reality-form");
    if (!context) throw new Error("Prefilled Reality Check form was not rendered");
    const result = await browserAxe.run(context, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
    });
    return result.violations.filter(({ impact }) => impact === "critical" || impact === "serious");
  });
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
});

test("generated onboarding context has no serious accessibility violation", async ({ page }) => {
  await page.goto("/en/profile");
  await page.locator("#birthDate").fill("1994-11-04");
  // Focus, concern and depth are folded away on the free page; open them first.
  await page.getByText("Tell it what you want to know, and it fits closer (optional)").click();
  await page.getByText("Relationships", { exact: true }).click();
  await page.locator("#concern").fill("How can I observe a recurring relationship pattern?");
  await page.getByText("Deep", { exact: true }).click();
  await page.locator('input[name="privacyRequired"]').check();
  await page.getByRole("button", { name: "Show my core pattern" }).click();
  await expect(page.locator(".onboarding-context-card")).toBeVisible();
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => {
    const browserAxe = (window as typeof window & {
      axe: { run: (context: Element, options: object) => Promise<{ violations: AxeViolation[] }> };
    }).axe;
    const context = document.querySelector(".onboarding-context-card");
    if (!context) throw new Error("Onboarding context was not rendered");
    const result = await browserAxe.run(context, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
    });
    return result.violations.filter(({ impact }) => impact === "critical" || impact === "serious");
  });
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
});

test("generated share controls have no serious accessibility violation", async ({ page }) => {
  await page.goto("/en/profile");
  await page.locator("#birthDate").fill("1994-11-04");
  await page.locator('input[name="privacyRequired"]').check();
  await page.getByRole("button", { name: "Show my core pattern" }).click();
  await page.getByText("Privacy-safe share card", { exact: true }).click();
  await page.addScriptTag({ content: axe.source });
  const result = await page.locator(".share-panel").evaluate(async (context) => {
    const browserAxe = (window as typeof window & {
      axe: { run: (context: Element, options: object) => Promise<{ violations: AxeViolation[] }> };
    }).axe;
    const audit = await browserAxe.run(context, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
    });
    const undersized = Array.from(context.querySelectorAll("button"))
      .filter((button) => {
        const rect = button.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      })
      .map((button) => button.textContent?.trim());
    return {
      violations: audit.violations.filter(
        ({ impact }) => impact === "critical" || impact === "serious",
      ),
      undersized,
    };
  });
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
  expect(result.undersized).toEqual([]);
  await expect(page.getByRole("status")).toHaveAttribute("aria-live", "polite");
});

test("skip link and generated result move keyboard focus", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Mobile WebKit does not expose desktop hardware-Tab focus order.");
  await page.goto("/en/profile");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await expect(page.locator(".skip-link")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page.locator("#birthDate").fill("1994-11-04");
  await page.getByText("I have read the privacy notice.").click();
  await page.getByRole("button", { name: "Show my core pattern" }).click();
  await expect(page.locator("#result")).toBeFocused();
});

test("mobile interactive targets meet the 44 pixel minimum", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/question");
  const undersized = await page.locator("button, summary, .bottom-nav a, .bottom-nav span, .locale-switch").evaluateAll((elements) =>
    elements
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      })
      .map((element) => ({
        text: element.textContent?.trim(),
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height,
      })),
  );
  expect(undersized).toEqual([]);
});

test("reduced motion turns result scrolling into an immediate move", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/profile");
  await page.evaluate(() => {
    const state = window as typeof window & { observedScrollBehavior?: ScrollBehavior };
    HTMLElement.prototype.scrollIntoView = function scrollIntoView(options?: boolean | ScrollIntoViewOptions) {
      if (typeof options === "object") state.observedScrollBehavior = options.behavior;
    };
  });
  await page.locator("#birthDate").fill("1994-11-04");
  await page.getByText("I have read the privacy notice.").click();
  await page.getByRole("button", { name: "Show my core pattern" }).click();
  await expect.poll(() => page.evaluate(() =>
    (window as typeof window & { observedScrollBehavior?: ScrollBehavior }).observedScrollBehavior,
  )).toBe("auto");
});

test("production headers and install metadata do not add offline data storage", async ({ page, request }) => {
  const response = await request.get("/en");
  expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["permissions-policy"]).toContain("microphone=()");

  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest.start_url).toBe("/ko");
  expect(manifest.display).toBe("standalone");
  expect(manifest).not.toHaveProperty("share_target");

  const iconResponse = await request.get("/icon.png");
  expect(iconResponse.ok()).toBe(true);
  expect(iconResponse.headers()["content-type"]).toContain("image/png");

  await page.goto("/en");
  const registrations = await page.evaluate(async () =>
    "serviceWorker" in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0,
  );
  expect(registrations).toBe(0);
});
