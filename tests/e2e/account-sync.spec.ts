import { expect, test } from "@playwright/test";

test("account panel reflects provider configuration without silently uploading device records", async ({ page }) => {
  const accountRequests: string[] = [];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const configured = Boolean(
    supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/account/")) {
      accountRequests.push(request.url());
    }
  });

  const response = await page.goto("/en/me");
  await expect(page.getByRole("heading", { name: "Account and secure sync" })).toBeVisible();
  if (configured) {
    expect(response?.headers()["content-security-policy"]).toContain(
      `connect-src 'self' ${new URL(supabaseUrl!).origin}`,
    );
    await expect(page.getByText("Sign in with an email link to sync device records to your account.")).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveAttribute("type", "email");
    await expect(page.getByRole("button", { name: "Send sign-in link" })).toBeVisible();
    await expect(page.getByText("only records you explicitly synchronize", { exact: false })).toBeVisible();
  } else {
    await expect(page.getByText("Server sync is not configured yet.")).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveCount(0);
  }
  expect(accountRequests).toEqual([]);
});

test("account data endpoints fail closed without an authenticated session or provider", async ({ page }) => {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  await page.goto("/en/me");
  const responses = await page.evaluate(async () => {
    const requests = [
      fetch("/api/account/sync"),
      fetch("/api/account/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }),
      fetch("/api/account/export"),
      fetch("/api/account/data?scope=all_data", {
        method: "DELETE",
        headers: { "x-client-request-id": "delete:test-request-0001" },
      }),
    ];
    return Promise.all((await Promise.all(requests)).map(async (response, index) => ({
      index,
      status: response.status,
      body: await response.json(),
      cacheControl: response.headers.get("cache-control") ?? "",
    })));
  });

  for (const response of responses) {
    if (response.status === 403) {
      expect(response.body).toEqual({ error: "CROSS_ORIGIN_REQUEST" });
    } else {
      expect(response.status, JSON.stringify(response)).toBe(configured ? 401 : 503);
      expect(response.body).toEqual({
        error: configured ? "AUTH_REQUIRED" : "SUPABASE_DISABLED",
      });
    }
    expect(response.cacheControl).not.toContain("public");
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
