import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config";

// Focused cross-engine coverage; the existing general/checkout CI matrix stays intact.
export default defineConfig({
  ...base,
  testDir: "./tests",
  testMatch: ["**/e2e/space.spec.ts", "**/visual/*.visual.ts"],
  snapshotPathTemplate: "{testDir}/visual/snapshots/{projectName}/{arg}{ext}",
  projects: [
    { name: "desktop-space", use: { ...devices["Desktop Chrome"], channel: "chromium" } },
    { name: "iphone-space", use: { ...devices["iPhone 13"], browserName: "webkit" } },
    { name: "android-space", use: { ...devices["Pixel 7"], browserName: "chromium", channel: "chromium" } },
  ],
});
