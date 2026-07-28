import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { isAdminEmail } from "@/server/admin-access";

const bodySchema = z.object({
  status: z.enum(["open", "answered", "closed"]),
  adminNote: z.string().trim().max(2_000).optional(),
}).strict();

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const auth = await requireSupabaseUser();
  if (!auth.user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  if (!isAdminEmail(auth.user.email)) {
    return NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
  }

  const [{ id }, body] = await Promise.all([context.params, request.json().catch(() => null)]);
  const parsed = bodySchema.safeParse(body);
  if (!z.string().uuid().safeParse(id).success || !parsed.success) {
    return NextResponse.json({ error: "INVALID_UPDATE" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "UNAVAILABLE" }, { status: 503 });

  const { error } = await admin
    .from("support_inquiries")
    .update({
      status: parsed.data.status,
      ...(parsed.data.adminNote === undefined ? {} : { admin_note: parsed.data.adminNote }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
