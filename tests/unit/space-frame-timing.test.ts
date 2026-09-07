import { expect, it } from "vitest";
import { activeFrameTiming } from "@/components/space/frame-timing";
it("includes the last moving frame but excludes idle time and separate camera clicks", () => {
  const frame = activeFrameTiming();
  expect(frame(100, true)).toBeNull(); expect(frame(116, true)).toBe(16); expect(frame(132, false)).toBe(16);
  expect(frame(5000, false)).toBeNull(); expect(frame(8000, true)).toBeNull(); expect(frame(8016, false)).toBe(16); expect(frame(12000, false)).toBeNull();
});
