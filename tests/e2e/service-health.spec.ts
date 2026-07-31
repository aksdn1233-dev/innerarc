import { expect, test } from "@playwright/test";

// The surfaces that exist so that changing a page cannot quietly take the site down.
// They are only worth having if they still work after the change that broke something
// else, so they are checked in the browser against the real production server.

test("the health endpoint answers without a session and without secrets", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  // Deliberately 200 even when degraded: an uptime monitor reads the body, and a
  // closed-but-healthy storefront must not look like an outage.
  const body = await response.json();
  expect(Object.keys(body).sort()).toEqual([
    "checkedAt",
    "database",
    "durationMs",
    "payments",
    "site",
    "status",
  ]);
  expect(["ok", "degraded"]).toContain(body.status);
  expect(["open", "closed"]).toContain(body.payments);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
});

test("an unknown address reads as a wrong turn, not an outage", async ({ page }) => {
  const response = await page.goto("/ko/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "찾을 수 없는 주소입니다" })).toBeVisible();

  // The rest of the site has to stay reachable from here.
  await page.getByRole("link", { name: "처음으로" }).click();
  await expect(page).toHaveURL(/\/ko$/);
  await expect(page.locator("#main-content")).toBeVisible();
});

test("the administrator console is never reachable without an account", async ({ page }) => {
  const response = await page.goto("/ko/admin");
  // Either the console's own sign-in or a 404 for a signed-in stranger; never the
  // payment readiness report, which names configuration.
  expect(page.url()).not.toContain("/ko/admin/payments");
  expect([200, 404]).toContain(response?.status() ?? 0);
  await expect(page.getByText("결제 열림 상태")).toHaveCount(0);
});
