import { NextResponse } from "next/server";
import { z } from "zod";
import { REVIEW_TYPES } from "@/core/reviews";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { isAdminEmail } from "@/server/admin-access";
import { moderateReview } from "@/server/reviews";
import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";

// Moderation is the only way a review becomes public, so this is the only endpoint that
// can write 'approved' and it is behind the same allowlist as the rest of the console.
// 'beta_participant' is settable here because only the owner knows who tested before
// launch; the other two labels are decided from the verified order and are not accepted
// as an override, so an unpaid reading can never be relabelled a verified purchase.
const bodySchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "withdrawn"]),
  reviewType: z.literal("beta_participant").optional(),
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

  const [{ id }, body] = await Promise.all([
    context.params,
    request.json().catch(() => null),
  ]);
  const parsed = bodySchema.safeParse(body);
  if (!z.string().uuid().safeParse(id).success || !parsed.success) {
    return NextResponse.json({ error: "INVALID_UPDATE" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "UNAVAILABLE" }, { status: 503 });

  const reviewType = parsed.data.reviewType && REVIEW_TYPES.includes(parsed.data.reviewType)
    ? parsed.data.reviewType
    : undefined;
  const updated = await moderateReview(admin, id, {
    status: parsed.data.status,
    reviewType,
    adminNote: parsed.data.adminNote,
  });
  if (!updated) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
