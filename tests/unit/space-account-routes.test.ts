import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), admin: vi.fn(), cleanup: vi.fn() }));
vi.mock("@/lib/supabase/auth", () => ({ requireSupabaseUser: mocks.auth }));
vi.mock("@/lib/supabase/admin", () => ({ resolveSupabaseAdminClient: mocks.admin }));
vi.mock("@/server/space/cleanup", () => ({ cleanSpaceAssets: mocks.cleanup }));
import { DELETE } from "@/app/api/account/data/route";
import { GET } from "@/app/api/account/export/route";
beforeEach(() => { vi.clearAllMocks(); mocks.admin.mockReturnValue({ client: null }); });
it.each(["all_data", "third_party"])("committed %s deletion keeps its receipt when storage is unavailable", async scope => {
  const receipt = { requestId: "delete_12345678", completedAt: "2026-09-07T00:00:00Z", duplicate: false };
  const rpc = vi.fn().mockResolvedValue({ data: receipt, error: null });
  mocks.auth.mockResolvedValue({ user: { id: "owner" }, client: { rpc }, error: null });
  mocks.cleanup.mockImplementation(() => new Promise(() => {}));
  const response = await DELETE(new Request(`https://example.test/api/account/data?scope=${scope}`, { method: "DELETE", headers: { origin: "https://example.test", "x-client-request-id": "delete_12345678" } }));
  expect(response.status).toBe(200); expect(await response.json()).toEqual({ ...receipt, spaceImageDeletionPending: scope === "all_data" });
  expect(mocks.admin).not.toHaveBeenCalled(); expect(mocks.cleanup).not.toHaveBeenCalled();
});
it("owner export orders each applied-change page by its complete composite key", async () => {
  const ordered: string[][] = [], pages: number[][] = [];
  const from = vi.fn((table: string) => {
    const order: string[] = []; let range = [0, 499];
    const q = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), is: vi.fn(), order: vi.fn(), limit: vi.fn(), range: vi.fn(), then: (resolve: (v: unknown) => unknown) => {
      const data = table === "space_applied_changes" && range[0] === 0 ? Array.from({ length: 500 }, (_, n) => ({ run_id: "same-run", recommendation_id: String(n) })) : [];
      return Promise.resolve({ data, error: null }).then(resolve);
    } };
    for (const name of ["select", "eq", "maybeSingle", "is", "limit"] as const) q[name].mockReturnValue(q);
    q.order.mockImplementation((key: string) => { order.push(key); return q; });
    q.range.mockImplementation((start: number, end: number) => { range = [start, end]; if (table === "space_applied_changes") { ordered.push(order); pages.push(range); } return q; });
    return q;
  });
  mocks.auth.mockResolvedValue({ user: { id: "owner" }, client: { from }, error: null });
  const response = await GET(); expect(response.status).toBe(200);
  expect(pages).toEqual([[0,499], [500,999]]); expect(ordered).toEqual([["run_id", "recommendation_id"], ["run_id", "recommendation_id"]]);
  expect((await response.json()).data.space.space_applied_changes).toHaveLength(500);
});
