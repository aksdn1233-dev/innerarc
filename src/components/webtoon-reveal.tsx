"use client";

import { useEffect } from "react";

/*
 * Panels rise into place as they reach the viewport, the way a webtoon episode hands you
 * one frame at a time instead of the whole page at once.
 *
 * The hiding is done by a class this component puts on <html>, never by the stylesheet on
 * its own. Without that, a reader whose script never ran — blocked, failed, still loading —
 * would be left looking at an empty column where the report they paid for should be. The
 * page is fully visible by default and only becomes animatable once we are certain we are
 * here to animate it.
 *
 * Results on the free pages appear after a form submit, so panels are still arriving long
 * after this mounts. A MutationObserver picks those up; without it every panel rendered
 * after the first paint would stay stuck at its hidden starting state.
 */
/* Built panels announce themselves with the attribute. Results that only borrow the panel
   rhythm through .webtoon-adapt keep their own markup, so their direct children are picked
   up positionally instead. Both halves are mirrored by the hidden-state rule in the
   stylesheet — change one and the other has to follow. */
const PANEL_SELECTOR = "[data-webtoon-panel], .webtoon-adapt > :is(header, section, div, details)";

/* Ref-counted, so a page that mounts two of these does not have the first one to unmount
   strip the class the second is still relying on. */
let mounted = 0;

export function WebtoonReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // Reduced motion is a request for the page to hold still, so nothing is hidden and
    // there is nothing to reveal.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    mounted += 1;
    root.classList.add("webtoon-js");

    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 },
    );

    const observe = (scope: ParentNode) => {
      const panels = scope.querySelectorAll?.(PANEL_SELECTOR) ?? [];
      for (const panel of panels) {
        if (seen.has(panel)) continue;
        seen.add(panel);
        io.observe(panel);
      }
    };

    observe(document);

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(PANEL_SELECTOR) && !seen.has(node)) {
            seen.add(node);
            io.observe(node);
          }
          observe(node);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      mounted -= 1;
      if (mounted === 0) root.classList.remove("webtoon-js");
    };
  }, []);

  return null;
}
