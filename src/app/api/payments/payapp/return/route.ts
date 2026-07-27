import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocale } from "@/i18n/config";

const returnSchema = z.object({
  locale: z.string().refine(isLocale),
  orderId: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/),
});

function returnToReport(request: Request) {
  const requestUrl = new URL(request.url);
  const parsed = returnSchema.safeParse(
    Object.fromEntries(requestUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_RETURN" }, { status: 400 });
  }
  const handoffUrl = new URL(
    `/${parsed.data.locale}/payments/payapp-return`,
    requestUrl.origin,
  );
  handoffUrl.searchParams.set("orderId", parsed.data.orderId);
  return NextResponse.redirect(handoffUrl, 303);
}

export async function GET(request: Request) {
  return returnToReport(request);
}

export async function POST(request: Request) {
  return returnToReport(request);
}
