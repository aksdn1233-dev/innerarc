import { defineConfig, devices } from "@playwright/test";

const useExternalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === "1";
const baseURL = useExternalServer
  ? process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000"
  : "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  // Most assertions here run against a reading the browser calculates itself, behind
  // dynamic imports, after a form submit. The five second default is enough on a warm
  // laptop and not always enough on a cold CI runner: the first-result checks failed on
  // main and on a pull request, in both locales, and passed on re-runs with nothing
  // changed. Deploy is gated on a green CI, so a check that turns on runner speed is a
  // release that silently does not go out.
  //
  // This buys patience, not leniency. An assertion that would fail still fails, and one
  // that passes still returns as soon as it is true.
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: useExternalServer
    ? undefined
    : {
        command: "node ./scripts/serve-production.mjs",
        url: "http://127.0.0.1:3000/ko",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
