import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AcquisitionSurveySchema } from "@/core/acquisition-survey";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { ORDER_PASS_COOKIE, readOrderPass, readOrderTicket } from "@/server/order-pass";
import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { authorizeReviewForOrder } from "@/server/reviews";
import { saveAcquisitionSurvey } from "@/server/acquisition-surveys";

const bodySchema = z.object({
  orderId: z.string().trim().regex(/^[A-Za-z0-9_-]{6,64}$/),
  access: z.string().trim().max(200).optional(),
  proof: z.string().trim().regex(/^[a-f0-9]{64}$/).optional(),
  ticket: z.string().trim().max(300).optional(),
  survey: AcquisitionSurveySchema,
}).strict();

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_SURVEY" }, { status: 400 });

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
    return NextResponse.json({ error: authorization.reason }, { status: 403 });
  }
  const saved = await saveAcquisitionSurvey(
    admin,
    parsed.data.orderId,
    parsed.data.survey,
    auth.user?.id,
  );
  return saved.ok
    ? NextResponse.json({ saved: true }, { headers: { "Cache-Control": "no-store" } })
    : NextResponse.json({ error: "SURVEY_SAVE_FAILED" }, { status: 503 });
}
