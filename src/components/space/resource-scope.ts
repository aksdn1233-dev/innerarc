/** Release every owned allocation on success, partial setup failure, context loss or retry. */
export function resourceScope() {
  let disposed = false;
  const releases: (() => void)[] = [];
  return {
    add(release: () => void) { if (disposed) release(); else releases.push(release); },
    dispose() { if (disposed) return; disposed = true; for (const release of releases.reverse()) { try { release(); } catch { /* Continue releasing independent GPU/browser resources. */ } } releases.length = 0; },
  };
}
