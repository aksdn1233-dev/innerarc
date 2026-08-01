import { expect, test } from "@playwright/test";
import axe from "axe-core";
import { E2E_ORIGIN } from "./test-origin";

type AxeViolation = {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical" | null;
  help: string;
};

function localDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

test("Reality Check queue stays explicit, prioritizes ready work, and updates after review", async ({
  page,
}) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== E2E_ORIGIN) externalRequests.push(url.href);
  });

  const createdAt = new Date(Date.now() - 10 * 86_400_000).toISOString();
  const reviewedAt = new Date(Date.now() - 2 * 86_400_000).toISOString();
  const baseRecord = (
    id: string,
    question: string,
    reviewDate: string,
  ) => ({
    id,
    clientRequestId: `create:${id}:request`,
    category: "relationship" as const,
    question,
    currentState: "A bounded test state.",
    interpretation: "A symbolic hypothesis to verify.",
    choice: "Observe before concluding.",
    actionPlan: "Record one observable result.",
    reviewDate,
    createdAt,
    updatedAt: createdAt,
    ruleVersion: "reality-check-1.0.0" as const,
  });
  const payload = {
    version: 1,
    records: [
      baseRecord("planned-item", "Planned relationship choice", localDateOffset(5)),
      baseRecord("due-item", "Ready relationship choice", localDateOffset(-1)),
      {
        ...baseRecord("reviewed-item", "Reviewed relationship choice", localDateOffset(-4)),
        updatedAt: reviewedAt,
        review: {
          clientRequestId: "review:reviewed-item:request",
          outcome: "The observable result.",
          fit: "mostly_relevant" as const,
          learning: "Ask about pace early.",
          reviewedAt,
          reviewedMonth: localDateOffset(0).slice(0, 7),
        },
      },
    ],
  };
  await page.addInitScript((storedPayload) => {
    localStorage.setItem("innerarc:reality-check:v1", JSON.stringify(storedPayload));
  }, payload);

  await page.goto("/en/reality-check");
  await expect(page.locator(".review-queue")).toHaveCount(0);
  await expect(page.getByText("No Reality Checks have been saved yet.")).toBeVisible();

  await page.getByRole("button", { name: "Load records from this device" }).click();
  const queue = page.locator(".review-queue");
  await expect(queue).toBeVisible();
  await expect(queue.locator(".review-queue-counts")).toContainText("Ready to review1");
  await expect(queue.locator(".review-queue-counts")).toContainText("Planned1");
  await expect(queue.locator(".review-queue-counts")).toContainText("Outcome reviewed1");

  const storageBeforeFilter = await page.evaluate(
    () => localStorage.getItem("innerarc:reality-check:v1"),
  );
  await queue.getByRole("button", { name: "Ready 1" }).click();
  await expect(queue.getByRole("button", { name: "Ready 1" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".reality-record")).toHaveCount(1);
  await expect(page.getByText("Ready relationship choice")).toBeVisible();
  await expect(page.getByText("Planned relationship choice")).toHaveCount(0);
  expect(await page.evaluate(
    () => localStorage.getItem("innerarc:reality-check:v1"),
  )).toBe(storageBeforeFilter);

  await queue.getByRole("button", { name: "Review next ready outcome" }).click();
  await expect(page.locator("#review-panel")).toBeFocused();
  await page.locator("#reality-outcome").fill("We met twice and communication stayed reciprocal.");
  await page.getByText("Mostly relevant", { exact: true }).click();
  await page.locator("#reality-learning").fill("Keep checking follow-through rather than imagined potential.");
  await page.getByRole("button", { name: "Save outcome" }).click();

  await expect(queue.locator(".review-queue-counts")).toContainText("Ready to review0");
  await expect(queue.locator(".review-queue-counts")).toContainText("Outcome reviewed2");
  await expect(page.getByText("No records match this status.")).toBeVisible();
  expect(await page.evaluate(
    () => JSON.parse(localStorage.getItem("innerarc:reality-check:v1")!).records
      .filter((record: { review?: unknown }) => record.review).length,
  )).toBe(2);

  await page.addScriptTag({ content: axe.source });
  const accessibility = await queue.evaluate(async (context) => {
    const browserAxe = (window as typeof window & {
      axe: { run: (context: Element, options: object) => Promise<{ violations: AxeViolation[] }> };
    }).axe;
    const result = await browserAxe.run(context, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
    });
    return {
      violations: result.violations.filter(
        ({ impact }) => impact === "critical" || impact === "serious",
      ),
      undersized: Array.from(context.querySelectorAll("button"))
        .filter((button) => {
          const rect = button.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44;
        })
        .map((button) => button.textContent?.trim()),
    };
  });
  expect(accessibility.violations, JSON.stringify(accessibility.violations, null, 2)).toEqual([]);
  expect(accessibility.undersized).toEqual([]);
  expect(externalRequests).toEqual([]);
  await expect(page).toHaveURL(/\/en\/reality-check$/);
});
