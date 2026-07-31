import { NextResponse } from "next/server";
import { z } from "zod";
import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { isAdminEmail } from "@/server/admin-access";

/**
 * Records the owner's explicit decision that this deployment may take money.
 *
 * The launch gate exists so that holding merchant credentials never opens sales by
 * itself; it does not exist to require a redeploy. A signed-in administrator typing
 * the confirmation phrase is the same explicit, attributable approval as setting
 * PAYMENTS_LAUNCH_APPROVED=true, and unlike the environment flag it is recorded with
 * who approved it and when.
 */
export const LAUNCH_CONFIRMATION_PHRASE = "판매 개시";

const bodySchema = z.object({
  approved: z.boolean(),
  confirmation: z.string().max(50).optional().default(""),
}).strict();

export async function PUT(request: Request) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const auth = await requireSupabaseUser();
  if (!auth.user || !isAdminEmail(auth.user.email)) {
    return NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_LAUNCH_REQUEST" }, { status: 400 });
  }
  // Turning sales on is the irreversible-feeling direction, so it is the one that has
  // to be typed. Turning them off must never be harder than turning them on.
  if (parsed.data.approved && parsed.data.confirmation.trim() !== LAUNCH_CONFIRMATION_PHRASE) {
    return NextResponse.json({ error: "CONFIRMATION_REQUIRED" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "UNAVAILABLE" }, { status: 503 });

  const now = new Date().toISOString();
  const { error } = await admin.from("admin_settings").upsert({
    id: 1,
    payments_launch_approved: parsed.data.approved,
    payments_launch_approved_at: parsed.data.approved ? now : null,
    payments_launch_approved_by: parsed.data.approved ? auth.user.id : null,
    updated_by: auth.user.id,
    updated_at: now,
  });
  if (error) {
    // Almost always the migration adding these columns has not been applied yet.
    return NextResponse.json(
      { error: "LAUNCH_APPROVAL_FAILED", detail: "MIGRATION_REQUIRED" },
      { status: 500 },
    );
  }
  return NextResponse.json({ approved: parsed.data.approved, approvedAt: parsed.data.approved ? now : null });
}
