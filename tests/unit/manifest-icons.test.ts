import { access } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

// The manifest kept pointing at /icon after that dynamic route was replaced by a
// static file, so every install prompt and store listing would have shown a broken
// icon. Each icon it advertises must exist in the build.
describe("web app manifest", () => {
  it("advertises icons that are actually shipped", async () => {
    const icons = manifest().icons ?? [];
    expect(icons.length).toBeGreaterThan(0);

    for (const icon of icons) {
      expect(icon.src.startsWith("/")).toBe(true);
      const candidates = [
        join("public", icon.src),
        join("src", "app", icon.src),
      ];
      const found = await Promise.all(candidates.map(async (path) => {
        try {
          await access(path);
          return true;
        } catch {
          return false;
        }
      }));
      expect(found.some(Boolean), `${icon.src} is not present in the build`).toBe(true);
    }
  });

  it("declares a maskable icon so Android does not letterbox it", () => {
    const icons = manifest().icons ?? [];
    expect(icons.some((icon) => icon.purpose === "maskable")).toBe(true);
  });
});
