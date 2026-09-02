import { expect, test } from "@playwright/test";

const checkoutEnabled = process.env.E2E_PAYMENT_CHECKOUT === "1";

const draft = {
  version: 1,
  locale: "en",
  productCode: "pro_30d",
  birthDate: "1994-11-04",
  name: "Minji Kim",
  focusId: "relationships",
  concern: "What should I verify before making this relationship decision?",
  createdAt: "2026-07-30T10:00:00.000Z",
} as const;

test.beforeEach(async ({ page }) => {
  test.skip(!checkoutEnabled, "Run with the explicit test-provider payment environment.");
  await page.route("https://pay.example.invalid/**", (route) => route.fulfill({
    contentType: "text/html",
    status: 200,
    body: "<title>Mock PayApp checkout</title>",
  }));
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
        orderName: "Premium in-depth reading",
        amount: 39_000,
        currency: "KRW",
        payUrl: "https://pay.example.invalid/e2e_order_01",
        reportUrl: `${new URL(route.request().url()).origin}/en/reports/e2e_order_01`,
      }),
    });
  });

  await page.goto("/en/plans?product=pro_30d");
  await expect(page.locator('[data-product="plus_30d"]')).toContainText("Four Pillars chart");
  await expect(page.locator("#customer-phone")).toBeVisible();
  // Moved here from campaign.spec.ts: the referral field is part of the checkout shell,
  // so it only renders when a provider is configured.
  await expect(page.locator("#referral-coupon")).toBeVisible();
  const premium = page.locator('[data-product="premium_pdf"]');
  await expect(premium.getByRole("button", { name: "Pay now" })).toBeEnabled();
  await premium.getByRole("button", { name: "Pay now" }).click();
  await expect(page.locator("p.error[role='alert']")).toHaveText(
    "Check the Korean mobile number used for payment instructions.",
  );
  expect(requests).toEqual([]);

  await page.locator("#customer-phone").fill("010-1234-5678");
  await premium.getByRole("button", { name: "Pay now" }).click();
  await expect(page).toHaveURL("https://pay.example.invalid/e2e_order_01");

  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({
    productCode: "premium_pdf",
    expectedAmount: expect.any(Number),
    customerPhone: "010-1234-5678",
    readingInput: {
      productCode: "premium_pdf",
      birthDate: "1994-11-04",
      concern: draft.concern,
    },
  });
});

test("temporarily unavailable checkout is not reported as a payment-window failure", async ({ page }) => {
  await page.route("**/api/payments/orders", (route) => route.fulfill({
    contentType: "application/json",
    status: 503,
    body: JSON.stringify({ error: "SALES_PAUSED" }),
  }));

  await page.goto("/en/plans?product=pro_30d");
  await expect(page.locator("#customer-phone")).toBeVisible();
  const detailCheckout = page.locator('[data-product="pro_30d"]')
    .getByRole("button", { name: "Pay now" });
  // The input is present in server HTML before React has restored the checkout
  // draft. Waiting for the enabled button prevents hydration from clearing a
  // phone number entered too early on slower WebKit devices.
  await expect(detailCheckout).toBeEnabled();
  await page.locator("#customer-phone").fill("01012345678");
  await expect(page.locator("#customer-phone")).toHaveValue("01012345678");
  await detailCheckout.click();
  await expect(page.locator("p.error[role='alert']")).toHaveText(
    "Checkout is temporarily paused. Your reading details are still here; please try again shortly.",
  );
  await expect(page.locator(".payment-widget-shell")).toHaveCount(0);
  await expect(page.locator(".payment-retry-notice")).toContainText(
    "do not pay the same order again",
  );
});

test("a rapid double click creates only one payment order", async ({ page }) => {
  let requestCount = 0;
  await page.route("**/api/payments/orders", async (route) => {
    requestCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        provider: "payapp",
        orderId: "e2e_order_once",
        orderName: "Detailed reading",
        amount: 9_600,
        currency: "KRW",
        payUrl: "https://pay.example.invalid/e2e_order_once",
        reportUrl: `${new URL(route.request().url()).origin}/en/reports/e2e_order_once`,
      }),
    });
  });

  await page.goto("/en/plans?product=pro_30d");
  const checkout = page.locator('[data-product="pro_30d"]')
    .getByRole("button", { name: "Pay now" });
  await expect(checkout).toBeEnabled();
  await page.locator("#customer-phone").fill("01012345678");
  await checkout.evaluate((button) => {
    (button as HTMLButtonElement).click();
    (button as HTMLButtonElement).click();
  });
  await expect(page).toHaveURL("https://pay.example.invalid/e2e_order_once");
  expect(requestCount).toBe(1);
});

test("the 9,600 KRW detailed report can be purchased with birth date only", async ({ page }) => {
  const requests: unknown[] = [];
  await page.addInitScript((value) => {
    window.sessionStorage.setItem("innerarc.checkoutDraft.v1", JSON.stringify(value));
  }, {
    ...draft,
    productCode: "pro_30d",
    concern: "",
  });
  await page.route("**/api/payments/orders", async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        provider: "payapp",
        orderId: "e2e_order_detail",
        orderName: "Detailed reading",
        amount: 9_600,
        currency: "KRW",
        payUrl: "https://pay.example.invalid/e2e_order_detail",
        reportUrl: `${new URL(route.request().url()).origin}/en/reports/e2e_order_detail`,
      }),
    });
  });

  await page.goto("/en/plans?product=pro_30d");
  const detailCheckout = page.locator('[data-product="pro_30d"]')
    .getByRole("button", { name: "Pay now" });
  await expect(detailCheckout).toBeEnabled();
  await page.locator("#customer-phone").fill("01012345678");
  await detailCheckout.click();
  await expect(page).toHaveURL("https://pay.example.invalid/e2e_order_detail");

  expect(requests).toHaveLength(1);
  expect(requests[0]).toMatchObject({
    productCode: "pro_30d",
    expectedAmount: expect.any(Number),
    readingInput: {
      productCode: "pro_30d",
      birthDate: "1994-11-04",
      concern: "",
    },
  });
});
