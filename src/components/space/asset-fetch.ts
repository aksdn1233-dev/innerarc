/** First-party asset downloads have a deadline covering headers AND the response body. */
export async function assetBytes(url: string, parent: AbortSignal, maxBytes: number, timeoutMs = 15_000): Promise<ArrayBuffer> {
  const controller = new AbortController(), cancel = () => controller.abort(parent.reason);
  const timer = setTimeout(() => controller.abort(new Error("ASSET_TIMEOUT")), timeoutMs);
  parent.addEventListener("abort", cancel, { once: true }); if (parent.aborted) cancel();
  try {
    const response = await fetch(url, { signal: controller.signal, credentials: "same-origin" });
    if (!response.ok) throw new Error("ASSET_UNAVAILABLE");
    if (Number(response.headers.get("content-length")) > maxBytes) throw new Error("ASSET_TOO_LARGE");
    const reader = response.body?.getReader(); if (!reader) throw new Error("ASSET_EMPTY");
    const chunks: Uint8Array[] = []; let size = 0;
    try { while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > maxBytes) throw new Error("ASSET_TOO_LARGE"); chunks.push(part.value); } }
    finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
    if (controller.signal.aborted) throw new Error("ASSET_LOAD_CANCELLED");
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return bytes.buffer;
  } finally { controller.abort(); clearTimeout(timer); parent.removeEventListener("abort", cancel); }
}
