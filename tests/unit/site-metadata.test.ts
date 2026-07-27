import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  createSocialImageResponse,
  socialImageAlt,
  socialImageContentType,
  socialImageSize,
} from "@/app/social-image";
import { getLocalizedSiteMetadata } from "@/i18n/site-metadata";

describe("site sharing metadata", () => {
  it("provides native, non-predictive Korean and English copy", () => {
    const ko = getLocalizedSiteMetadata("ko");
    const en = getLocalizedSiteMetadata("en");
    const combined = [ko.title, ko.description, en.title, en.description].join(" ");

    expect(ko.title).toContain("타로·신점");
    expect(en.title).toContain("Patterns That Repeat");
    expect(ko.openGraphLocale).toBe("ko_KR");
    expect(en.openGraphLocale).toBe("en_US");
    expect(combined).not.toMatch(/정확도|정확히 예측|반드시|보장|accuracy|predicts? exactly|guaranteed/i);
  });

  it("serves one bounded first-party PNG with explicit accessible metadata", async () => {
    const response = await createSocialImageResponse();
    const bytes = new Uint8Array(await response.arrayBuffer());
    const file = await readFile("public/og.png");

    expect(response.headers.get("content-type")).toBe(socialImageContentType);
    expect(response.headers.get("cache-control")).toContain("immutable");
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      createHash("sha256").update(file).digest("hex"),
    );
    expect(bytes.byteLength).toBeLessThan(5 * 1024 * 1024);
    expect(bytes[0]).toBe(0x89);
    expect(String.fromCharCode(...bytes.slice(1, 4))).toBe("PNG");
    expect(new DataView(bytes.buffer).getUint32(16)).toBe(socialImageSize.width);
    expect(new DataView(bytes.buffer).getUint32(20)).toBe(socialImageSize.height);
    expect(socialImageAlt).toContain("InnerArc");
  });
});
