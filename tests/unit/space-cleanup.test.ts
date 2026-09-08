import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cleanSpaceAssets } from "@/server/space/cleanup";
function query(data: unknown, error: unknown = null) {
  const q = { select: vi.fn(), lt: vi.fn(), lte: vi.fn(), order: vi.fn(), limit: vi.fn(), delete: vi.fn(), in: vi.fn(), update: vi.fn(), eq: vi.fn(), then: (resolve: (v: { data: unknown; error: unknown }) => unknown) => Promise.resolve({ data, error }).then(resolve) };
  for (const method of ["select", "lt", "lte", "order", "limit", "delete", "in", "update", "eq"] as const) q[method].mockReturnValue(q);
  return q;
}
describe("space retention cleanup", () => {
  it("leaves old deployment daily jobs usable before migration", async () => { const admin = { from: vi.fn().mockReturnValue(query(null, { code: "42P01" })) }; expect(await cleanSpaceAssets(admin as unknown as SupabaseClient)).toEqual({ removed: 0, unavailable: true }); });
  it("deletes expired metadata before processing its durable blob queue", async () => { const expired = query([{ id: "expired" }]), deleted = query(null), pending = query([{ object_path: "private.jpg", attempts: 0, generation: "old" }]), settled = query([{ object_path: "private.jpg" }]); const remove = vi.fn().mockResolvedValue({ error: null }); const admin = { from: vi.fn().mockReturnValueOnce(expired).mockReturnValueOnce(deleted).mockReturnValueOnce(pending).mockReturnValueOnce(settled), storage: { from: vi.fn().mockReturnValue({ remove }) } }; expect(await cleanSpaceAssets(admin as unknown as SupabaseClient)).toEqual({ removed: 1, unavailable: false }); expect(deleted.in).toHaveBeenCalledWith("id", ["expired"]); expect(pending.limit).toHaveBeenCalledWith(100); expect(remove).toHaveBeenCalledWith(["private.jpg"]); });
  it("backs off a failing blob so it cannot starve the next batch", async () => { const now = new Date("2026-09-07T00:00:00Z"), updated = query(null); const admin = { from: vi.fn().mockReturnValueOnce(query([])).mockReturnValueOnce(query([{ object_path: "poison.jpg", attempts: 7, generation: "old" }])).mockReturnValueOnce(updated), storage: { from: vi.fn().mockReturnValue({ remove: vi.fn().mockResolvedValue({ error: { message: "outage" } }) }) } }; expect((await cleanSpaceAssets(admin as unknown as SupabaseClient, now)).removed).toBe(0); expect(updated.update).toHaveBeenCalledWith({ attempts: 8, next_attempt_at: "2026-09-08T00:00:00.000Z" }); });
  it("does not acknowledge a new retry queued during an older removal", async () => {
    let generation = "old";
    const settled = query(null); settled.then = resolve => Promise.resolve({ data: settled.eq.mock.calls.some(([key, value]) => key === "generation" && value === generation) ? [{ object_path: "racing.jpg" }] : [], error: null }).then(resolve);
    const remove = vi.fn().mockImplementation(async () => { generation = "new-upload-retry"; return { error: null }; });
    const admin = { from: vi.fn().mockReturnValueOnce(query([])).mockReturnValueOnce(query([{ object_path: "racing.jpg", attempts: 0, generation: "old" }])).mockReturnValueOnce(settled), storage: { from: vi.fn().mockReturnValue({ remove }) } };
    expect((await cleanSpaceAssets(admin as unknown as SupabaseClient)).removed).toBe(0);
    expect(settled.eq).toHaveBeenCalledWith("generation", "old"); expect(generation).toBe("new-upload-retry");
  });
  it("does not discard a queue item if deleting its receipt fails", async () => { const admin = { from: vi.fn().mockReturnValueOnce(query([])).mockReturnValueOnce(query([{ object_path: "already-gone.jpg", attempts: 0, generation: "old" }])).mockReturnValueOnce(query(null, { message: "db outage" })), storage: { from: vi.fn().mockReturnValue({ remove: vi.fn().mockResolvedValue({ error: null }) }) } }; expect((await cleanSpaceAssets(admin as unknown as SupabaseClient)).removed).toBe(0); });
});

describe("late upload recovery across storage and database outages", () => {
  it("retains the old tombstone and sweeps a late object after compensation and re-enqueue fail", async () => {
    const now = new Date("2026-09-07T00:00:00Z"), retainUntil = "2026-09-08T00:00:00Z";
    let blobExists = false;
    const tombstone = { object_path: "late.jpg", attempts: 0, generation: "old", retain_until: retainUntil };
    const firstAck = query(null), secondAck = query(null);
    const remove = vi.fn().mockImplementation(async () => { blobExists = false; return { error: null }; });
    const admin = { from: vi.fn().mockReturnValueOnce(query([])).mockReturnValueOnce(query([tombstone])).mockReturnValueOnce(firstAck).mockReturnValueOnce(query([])).mockReturnValueOnce(query([tombstone])).mockReturnValueOnce(secondAck), storage: { from: vi.fn().mockReturnValue({ remove }) } };
    await cleanSpaceAssets(admin as unknown as SupabaseClient, now);
    expect(firstAck.delete).not.toHaveBeenCalled(); expect(firstAck.update).toHaveBeenCalledWith({ last_removed_at: now.toISOString(), next_attempt_at: "2026-09-07T01:00:00.000Z" });
    blobExists = true; // Late upload appears; its compensating removal and DB re-enqueue both fail.
    await cleanSpaceAssets(admin as unknown as SupabaseClient, new Date("2026-09-07T01:00:00Z"));
    expect(blobExists).toBe(false); expect(secondAck.delete).not.toHaveBeenCalled();
  });
});
