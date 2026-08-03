import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ReviewSubmissionSchema } from "@/core/reviews";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { ORDER_PASS_COOKIE, readOrderPass, readOrderTicket } from "@/server/order-pass";
import { authorizeReviewForOrder, saveReview } from "@/server/reviews";
import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";

// A review is only accepted from a browser that can already open the completed reading
// it is about. The proof carried here is the same set the report page itself accepts:
// the guest access token, the signed return ticket, the order pass cookie, or the
// order-number-plus-phone lookup proof.
const bodySchema = z.object({
  orderId: z.string().trim().regex(/^[A-Za-z0-9_-]{6,64}$/),
  access: z.string().trim().max(200).optional(),
  proof: z.string().trim().regex(/^[a-f0-9]{64}$/).optional(),
  ticket: z.string().trim().max(300).optional(),
  review: ReviewSubmissionSchema,
}).strict();

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_REVIEW" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "UNAVAILABLE" }, { status: 503 });

  const now = new Date();
  const [auth, cookieStore] = await Promise.all([requireSupabaseUser(), cookies()]);
  const provenOrderId = readOrderTicket(parsed.data.ticket, now) ??
    readOrderPass(cookieStore.get(ORDER_PASS_COOKIE)?.value, now)?.orderId;

  const authorization = await authorizeReviewForOrder({
    admin,
    orderId: parsed.data.orderId,
    userId: auth.user?.id,
    accessToken: parsed.data.access,
    lookupProof: parsed.data.proof,
    provenOrderId: provenOrderId ?? undefined,
  });
  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.reason },
      { status: authorization.reason === "NOT_AUTHORIZED" ? 403 : 409 },
    );
  }

  const saved = await saveReview(admin, {
    authorization,
    submission: parsed.data.review,
  });
  if (!saved.ok) {
    return NextResponse.json(
      { error: saved.reason },
      { status: saved.reason === "ALREADY_REVIEWED" ? 409 : 503 },
    );
  }

  // Nothing is published here. The response says only that the review was received and
  // whether the reviewer asked for it to be considered for public display.
  return NextResponse.json(
    { received: true, awaitingApproval: parsed.data.review.publicConsent },
    { headers: { "Cache-Control": "no-store" } },
  );
}
