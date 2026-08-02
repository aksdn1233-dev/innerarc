import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { isAdminEmail } from "@/server/admin-access";
import { AdminPageContentSchema } from "@/server/admin-content";
import { writeStoredPageContent } from "@/server/admin-storage";

const bodySchema = z.object({
  salesEnabled: z.boolean(),
  notice: z.string().max(500),
  pageContent: AdminPageContentSchema,
}).strict();

export async function PUT(request: Request) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const auth = await requireSupabaseUser();
  if (!auth.user || !isAdminEmail(auth.user.email)) {
    return NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_ADMIN_SETTINGS" }, { status: 400 });
  }
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "UNAVAILABLE" }, { status: 503 });
  try {
    await writeStoredPageContent(admin, parsed.data.pageContent);
  } catch {
    return NextResponse.json({ error: "ADMIN_CONTENT_FAILED" }, { status: 500 });
  }
  const { error } = await admin.from("admin_settings").upsert({
    id: 1,
    sales_enabled: parsed.data.salesEnabled,
    notice: parsed.data.notice,
    updated_by: auth.user.id,
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: "ADMIN_SETTINGS_FAILED" }, { status: 500 });
  return NextResponse.json({ saved: true });
}
