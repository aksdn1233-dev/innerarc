import { safeSpace } from "@/server/space/access";
import { projectOperation } from "@/server/space/service";
export const dynamic = "force-dynamic";
export const POST = (request: Request, context: { params: Promise<{ projectId: string; operation: string }> }) => safeSpace(async () => {
  const { projectId, operation } = await context.params;
  return projectOperation(request, projectId, operation);
});
