import { expect, test } from "@playwright/test";

test("configured account panel offers email sign-in without silently uploading device records", async ({ page }) => {
  const accountRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/account/")) {
      accountRequests.push(request.url());
    }
  });

  const response = await page.goto("/en/me");
  expect(response?.headers()["content-security-policy"]).toContain(
    "connect-src 'self' https://ytssrbmjyufphjyafjqa.supabase.co",
  );

  await expect(page.getByRole("heading", { name: "Account and secure sync" })).toBeVisible();
  await expect(page.getByText("Sign in with an email link to sync device records to your account.")).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveAttribute("type", "email");
  await expect(page.getByRole("button", { name: "Send sign-in link" })).toBeVisible();
  await expect(page.getByText("only records you explicitly synchronize", { exact: false })).toBeVisible();
  expect(accountRequests).toEqual([]);
});

test("account data endpoints fail closed without an authenticated session", async ({ request }) => {
  const syncRead = await request.get("/api/account/sync");
  const syncWrite = await request.post("/api/account/sync", { data: {} });
  const accountExport = await request.get("/api/account/export");
  const accountDelete = await request.delete("/api/account/data?scope=all_data", {
    headers: { "x-client-request-id": "delete:test-request-0001" },
  });

  for (const response of [syncRead, syncWrite, accountExport, accountDelete]) {
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: "AUTH_REQUIRED" });
    expect(response.headers()["cache-control"] ?? "").not.toContain("public");
  }
});

test("the allowlisted site URL forwards a magic-link code to the locale-aware callback", async ({ page }) => {
  await page.goto("/ko/me");
  await page.context().addCookies([{
    name: "innerarc-auth-locale",
    value: "ko",
    domain: "127.0.0.1",
    path: "/",
  }]);

  const response = await page.request.get("/?code=test-code", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe(
    "/auth/callback?code=test-code&next=%2Fko%2Fme",
  );
});
