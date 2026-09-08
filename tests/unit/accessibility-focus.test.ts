import { afterEach, expect, test, vi } from "vitest";
import { focusAndScroll, scrollToElement } from "@/components/accessibility";

afterEach(() => vi.unstubAllGlobals());

function setup() {
  const frames: FrameRequestCallback[] = [];
  const origin = {};
  const target = { focus: vi.fn(), scrollIntoView: vi.fn() };
  const document = { activeElement: origin, body: {}, querySelector: vi.fn(() => target) };
  vi.stubGlobal("document", document);
  vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => frames.push(frame));
  vi.stubGlobal("window", { matchMedia: () => ({ matches: false }) });
  return { frames, target, document };
}

test("form feedback moves focus and scrolls without an input-disrupting animation", () => {
  const { frames, target } = setup();
  focusAndScroll("#result");
  frames[0](0);
  expect(target.focus).toHaveBeenCalledWith({ preventScroll: true });
  expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "instant", block: "start" });
});

test("a delayed result cannot take focus from the field the reader started editing", () => {
  const { frames, target, document } = setup();
  focusAndScroll("#result");
  document.activeElement = { input: true };
  frames[0](0);
  expect(target.focus).not.toHaveBeenCalled();
  expect(target.scrollIntoView).not.toHaveBeenCalled();
});

test("only the newest pending result may move focus", () => {
  const { frames, target, document } = setup();
  focusAndScroll("#old");
  focusAndScroll("#new");
  frames.forEach(frame => frame(0));
  expect(document.querySelector).toHaveBeenCalledExactlyOnceWith("#new");
  expect(target.focus).toHaveBeenCalledTimes(1);
});

test("return navigation cancels a pending result focus", () => {
  const { frames, target, document } = setup();
  focusAndScroll("#result");
  scrollToElement("#form");
  frames[0](0);
  expect(document.querySelector).toHaveBeenCalledExactlyOnceWith("#form");
  expect(target.focus).not.toHaveBeenCalled();
});
