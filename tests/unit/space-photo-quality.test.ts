import { describe, expect, it } from "vitest";
import { assessPhotoPixels, usablePhotoSet } from "@/core/space/photo-quality";

function pixels(width: number, height: number, value: (x: number, y: number) => number) {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const i = (y * width + x) * 4, n = value(x, y); data[i] = data[i + 1] = data[i + 2] = n; data[i + 3] = 255; }
  return data;
}

describe("deterministic space photo diagnostics", () => {
  it("accepts a detailed, exposed camera-sized frame", () => {
    const quality = assessPhotoPixels(pixels(720, 480, (x, y) => 25 + (x * 11 + y * 7) % 205), 720, 480);
    expect(quality.status).toBe("good"); expect(quality.issues).toEqual([]); expect(quality.megapixels).toBe(.35);
  });
  it.each([
    [320, 240, 120, "too_small"], [720, 480, 2, "underexposed"], [720, 480, 254, "overexposed"],
  ] as const)("rejects unusable %sx%s evidence", (width, height, value, issue) => {
    const quality = assessPhotoPixels(pixels(width, height, () => value), width, height);
    expect(quality.status).toBe("unusable"); expect(quality.issues).toContain(issue);
  });
  it("requires two usable frames including one clean overview-quality frame", () => {
    const good = assessPhotoPixels(pixels(720, 480, (x, y) => 25 + (x * 11 + y * 7) % 205), 720, 480);
    const review = assessPhotoPixels(pixels(720, 480, (x, y) => 45 + (x + y) % 30), 720, 480);
    const bad = assessPhotoPixels(pixels(320, 240, () => 120), 320, 240);
    expect(usablePhotoSet([good, review])).toBe(true); expect(usablePhotoSet([review, review])).toBe(false); expect(usablePhotoSet([good, bad])).toBe(false);
  });
});
