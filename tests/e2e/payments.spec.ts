import { expect, test } from "@playwright/test";

const checkoutEnabled = process.env.E2E_PAYMENT_CHECKOUT === "1";

const draft = {
  version: 1,
  locale: "en",
  productCode: "plus_30d",
  birthDate: "1994-11-04",
  name: "Minji Kim",
  focusId: "relationships",
  concern: "What should I verify before making this relationship decision?",
  createdAt: "2026-07-30T10:00:00.000Z",
} as const;

test.beforeEach(async ({ page }) => {
  test.skip(!checkoutEnabled, "Run with the explicit test-provider payment environment.");
  await page.addInitScript((value) => {
    window.sessionStorage.setItem("innerarc.checkoutDraft.v1", JSON.stringify(value));
  }, draft);
});

test("checkout validates locally and switches product and report input together", async ({ page }) => {
  const requests: unknown[] = [];
  await page.route("**/api/payments/orders", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        provider: "payapp",
        orderId: "e2e_order_01",
        orderName: "Premium custom PDF",
        amount: 79_000,
        currency: "KRW",
        payUrl: "https://pay.example.invalid/e2e_order_01",
        reportUrl: `${new URL(route.request().url()).origin}/en/reports/e2e_order_01`,
      }),
    });
  });

  await page.goto("/en/plans?product=plus_30d");
  await expect(page.locator("#customer-phone")).toBeVisible();
  const premium = page.locator('[data-product="premium_pdf"]');
  await expect(premium.getByRole("button", { name: "Load payment methods" })).toBeEnabled();
  await premium.getByRole("button", { name: "Load payment methods" }).click();
  await expect(page.locator("p.error[role='alert']")).toHaveText(
    "Check the Korean mobile number used for payment instructions.",
  );
  expect(requests).toEqual([]);

  await page.locator("#customer-phone").fill("010-1234-5678");
  await premium.getByRole("button", { name: "Load payment methods" }).click();
  await expect(page.locator(".payment-widget-shell")).toBeVisible();
  await expect(page.getByText("Save this address first")).toBeVisible();

  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({
    productCode: "premium_pdf",
    customerPhone: "010-1234-5678",
    readingInput: {
      productCode: "premium_pdf",
      birthDate: "1994-11-04",
      concern: draft.concern,
    },
  });
  await expect.poll(() => page.evaluate(() => {
    const raw = window.sessionStorage.getItem("innerarc.checkoutDraft.v1");
    return raw ? JSON.parse(raw).productCode : null;
  })).toBe("premium_pdf");
});

test("temporarily unavailable checkout is not reported as a payment-window failure", async ({ page }) => {
  await page.route("**/api/payments/orders", (route) => route.fulfill({
    contentType: "application/json",
    status: 503,
    body: JSON.stringify({ error: "SALES_PAUSED" }),
  }));

  await page.goto("/en/plans?product=plus_30d");
  await expect(page.locator("#customer-phone")).toBeVisible();
  const quickCheckout = page.locator('[data-product="plus_30d"]')
    .getByRole("button", { name: "Load payment methods" });
  // The input is present in server HTML before React has restored the checkout
  // draft. Waiting for the enabled button prevents hydration from clearing a
  // phone number entered too early on slower WebKit devices.
  await expect(quickCheckout).toBeEnabled();
  await page.locator("#customer-phone").fill("01012345678");
  await expect(page.locator("#customer-phone")).toHaveValue("01012345678");
  await quickCheckout.click();
  await expect(page.locator("p.error[role='alert']")).toHaveText(
    "Checkout is temporarily paused. Your reading details are still here; please try again shortly.",
  );
  await expect(page.locator(".payment-widget-shell")).toHaveCount(0);
});
