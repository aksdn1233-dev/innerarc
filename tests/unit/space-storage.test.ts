import { afterEach, describe, expect, it, vi } from "vitest";
import { spaceStorageFetch } from "@/server/space/storage";
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe("space-only storage transport deadline", () => {
  it("wires the 30-second deadline into the actual storage transport", async () => {
    const deadline = new AbortController(); const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(deadline.signal); let observed: AbortSignal | null | undefined;
    vi.stubGlobal("fetch", vi.fn().mockImplementation((_input, init) => { observed = init.signal; return Promise.resolve(new Response()); }));
    await spaceStorageFetch("https://example.test/storage");
    expect(observed?.aborted).toBe(false);
    expect(timeout).toHaveBeenCalledWith(30_000); deadline.abort();
    expect(observed?.aborted).toBe(true);
  });
  it("preserves the caller's cancellation signal", async () => {
    const controller = new AbortController(); let observed: AbortSignal | null | undefined;
    vi.stubGlobal("fetch", vi.fn().mockImplementation((_input, init) => { observed = init.signal; return Promise.resolve(new Response()); }));
    await spaceStorageFetch("https://example.test/storage", { signal: controller.signal }); controller.abort();
    expect(observed?.aborted).toBe(true);
  });
});
