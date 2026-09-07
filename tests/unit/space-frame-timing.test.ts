import { expect, it } from "vitest";
import { activeFrameTiming, isInViewport, isSoftwareRendererName, shouldReduceQuality, shouldUseImmediateMotion } from "@/components/space/frame-timing";
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

it("uses an emergency ceiling and otherwise waits for representative samples", () => {
  expect(shouldReduceQuality(101, 4, 1)).toBe(true);
  expect(shouldReduceQuality(39, 11, 25)).toBe(false);
  expect(shouldReduceQuality(39, 12, 1)).toBe(true);
  expect(shouldReduceQuality(20, 12, 25)).toBe(true);
  expect(shouldReduceQuality(38, 12, 24)).toBe(false);
});

it("recognizes known software renderer labels without classifying hardware GPUs", () => {
  expect(isSoftwareRendererName("ANGLE (Google, Vulkan SwiftShader Device (Subzero))")).toBe(true);
  expect(isSoftwareRendererName("llvmpipe (LLVM 19.1.7, 256 bits)")).toBe(true);
  expect(isSoftwareRendererName("Microsoft Basic Software Rasterizer")).toBe(true);
  expect(isSoftwareRendererName("Apple GPU")).toBe(false);
});

it("uses immediate validated motion only after repeated over-ceiling frames", () => {
  expect(shouldUseImmediateMotion(101, 3)).toBe(false);
  expect(shouldUseImmediateMotion(100, 4)).toBe(false);
  expect(shouldUseImmediateMotion(101, 4)).toBe(true);
});
