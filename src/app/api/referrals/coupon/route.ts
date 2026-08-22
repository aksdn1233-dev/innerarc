import { NextResponse } from "next/server";
import { z } from "zod";
import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { issueReferralCoupon, REFERRAL_COUPON_EXPIRES_AT } from "@/server/referral-coupon";

const schema = z.object({ phone: z.string().trim().regex(/^01[016789]-?\d{3,4}-?\d{4}$/) }).strict();

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_PHONE" }, { status: 400 });
  const couponCode = issueReferralCoupon(parsed.data.phone);
  if (!couponCode) return NextResponse.json({ error: "COUPON_UNAVAILABLE" }, { status: 503 });
  return NextResponse.json({ couponCode, expiresAt: REFERRAL_COUPON_EXPIRES_AT }, { headers: { "Cache-Control": "no-store" } });
}
