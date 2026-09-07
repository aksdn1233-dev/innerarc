import { afterEach, expect, it, vi } from "vitest";
import { assetBytes } from "@/components/space/asset-fetch";
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
it("caps streamed asset bytes even without a Content-Length", async () => {
  let cancelled = false;
  const body = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(6)); }, cancel() { cancelled = true; } });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body)));
  await expect(assetBytes("/asset", new AbortController().signal, 5)).rejects.toThrow("ASSET_TOO_LARGE"); expect(cancelled).toBe(true);
});
it("ends stalled body downloads and leaves no deadline timer", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", vi.fn(async (_url, init) => new Response(new ReadableStream({ start(controller) { init.signal.addEventListener("abort", () => controller.error(new Error("aborted"))); } }))));
  const pending = assetBytes("/asset", new AbortController().signal, 10, 50); const assertion = expect(pending).rejects.toThrow("aborted");
  await vi.advanceTimersByTimeAsync(51); await assertion; expect(vi.getTimerCount()).toBe(0);
});
it("reassembles bounded chunks and cancels its deadline on success", async () => {
  vi.useFakeTimers(); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Uint8Array([1,2,3]))));
  expect(new Uint8Array(await assetBytes("/asset", new AbortController().signal, 3))).toEqual(new Uint8Array([1,2,3])); expect(vi.getTimerCount()).toBe(0);
});

for (const status of [200,503]) it(`aborts transport after rejecting ${status === 200 ? "declared size" : "HTTP status"} before body consumption`, async () => {
  let signal: AbortSignal | undefined;
  vi.stubGlobal("fetch", vi.fn(async (_url, init) => { signal = init.signal; return new Response(new ReadableStream(), { status, headers: { "content-length": "999" } }); }));
  await expect(assetBytes("/asset", new AbortController().signal, 5)).rejects.toThrow(status === 200 ? "ASSET_TOO_LARGE" : "ASSET_UNAVAILABLE");
  expect(signal?.aborted).toBe(true);
});
