import { expect, it, vi } from "vitest";
import { resourceScope } from "@/components/space/resource-scope";
it("cleans partial allocations once in reverse order, including after a failed disposer", () => {
  const scope = resourceScope(), events: string[] = [];
  scope.add(() => events.push("renderer")); scope.add(() => { events.push("textures"); throw new Error("synthetic cleanup failure"); }); scope.add(() => events.push("listeners"));
  scope.dispose(); scope.dispose(); expect(events).toEqual(["listeners", "textures", "renderer"]);
  const late = vi.fn(); scope.add(late); expect(late).toHaveBeenCalledOnce();
});
