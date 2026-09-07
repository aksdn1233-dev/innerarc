/** Sample active transitions only; idle reading time must never be reported as a slow frame. */
export function activeFrameTiming() {
  let last: number | null = null, continuing = false;
  return (now: number, continuesMotion: boolean) => {
    const interval = last !== null && continuing ? now - last : null;
    last = now; continuing = continuesMotion; return interval;
  };
}

/** Animating a canvas that is completely outside the viewport wastes battery and
 * browsers intentionally throttle its animation frames. Partially visible rooms
 * still animate so a user can keep the scene and controls in view together. */
export function isInViewport(
  rect: Pick<DOMRect, "left" | "right" | "top" | "bottom">,
  viewportWidth: number,
  viewportHeight: number,
) {
  return rect.right > 0 && rect.left < viewportWidth && rect.bottom > 0 && rect.top < viewportHeight;
}
