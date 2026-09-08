import { safeSpace } from "@/server/space/access";
import { project } from "@/server/space/service";
type Context = { params: Promise<{ projectId: string }> };
export const dynamic = "force-dynamic";
export const GET = (request: Request, context: Context) => safeSpace(async () => project(request, (await context.params).projectId));
export const DELETE = (request: Request, context: Context) => safeSpace(async () => project(request, (await context.params).projectId));
