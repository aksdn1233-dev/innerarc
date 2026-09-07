/** Sample active transitions only; idle reading time must never be reported as a slow frame. */
export function activeFrameTiming() {
  let last: number | null = null, continuing = false;
  return (now: number, continuesMotion: boolean) => {
    const interval = last !== null && continuing ? now - last : null;
    last = now; continuing = continuesMotion; return interval;
  };
}

/** The emergency ceiling catches a visibly frozen transition quickly. Normal
 * degradation waits for a representative sample so one shader warm-up frame
 * cannot permanently lower the room quality. */
export function shouldReduceQuality(frameP90Ms: number, sampleCount: number, renderP90Ms: number) {
  return frameP90Ms > 100 || (sampleCount >= 12 && (frameP90Ms > 38 || renderP90Ms > 24));
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
