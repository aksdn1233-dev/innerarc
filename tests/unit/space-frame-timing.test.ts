import { expect, it } from "vitest";
import { activeFrameTiming, isInViewport } from "@/components/space/frame-timing";
it("includes the last moving frame but excludes idle time and separate camera clicks", () => {
  const frame = activeFrameTiming();
  expect(frame(100, true)).toBeNull(); expect(frame(116, true)).toBe(16); expect(frame(132, false)).toBe(16);
  expect(frame(5000, false)).toBeNull(); expect(frame(8000, true)).toBeNull(); expect(frame(8016, false)).toBe(16); expect(frame(12000, false)).toBeNull();
});

it("animates partial visibility but rejects every fully offscreen direction", () => {
  expect(isInViewport({ left: 20, right: 220, top: -80, bottom: 120 }, 390, 664)).toBe(true);
  expect(isInViewport({ left: 20, right: 220, top: -540, bottom: 0 }, 390, 664)).toBe(false);
  expect(isInViewport({ left: 390, right: 600, top: 10, bottom: 200 }, 390, 664)).toBe(false);
  expect(isInViewport({ left: -200, right: 0, top: 10, bottom: 200 }, 390, 664)).toBe(false);
  expect(isInViewport({ left: 20, right: 220, top: 664, bottom: 900 }, 390, 664)).toBe(false);
});
