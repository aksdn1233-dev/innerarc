export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

let focusRequest = 0;

export function focusAndScroll(selector: string): void {
  const request = ++focusRequest;
  const origin = document.activeElement;
  requestAnimationFrame(() => {
    // Never steal focus after the reader has already moved to another control.
    if (request !== focusRequest || (document.activeElement !== origin && document.activeElement !== document.body)) return;
    const target = document.querySelector<HTMLElement>(selector);
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      // Form feedback must settle before the next field can be edited.
      behavior: "instant",
      block: "start",
    });
  });
}

export function scrollToElement(selector: string): void {
  ++focusRequest;
  const target = document.querySelector<HTMLElement>(selector);
  target?.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}
