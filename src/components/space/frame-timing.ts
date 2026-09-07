/** Sample active transitions only; idle reading time must never be reported as a slow frame. */
export function activeFrameTiming() {
  let last: number | null = null, continuing = false;
  return (now: number, continuesMotion: boolean) => {
    const interval = last !== null && continuing ? now - last : null;
    last = now; continuing = continuesMotion; return interval;
  };
}
