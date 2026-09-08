import { safeSpace } from "@/server/space/access";
import { projects } from "@/server/space/service";
export const dynamic = "force-dynamic";
export const GET = (request: Request) => safeSpace(() => projects(request));
export const POST = (request: Request) => safeSpace(() => projects(request));
