import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// Buyers have no account, so the order number they quote is the only thread back to
// their purchase. Everything here is written by an untrusted visitor and is bounded
// before storage; it is never rendered as markup.
const bodySchema = z.object({
  category: z.enum(["payment", "report", "refund", "other"]),
  contact: z.string().trim().min(5).max(120),
  message: z.string().trim().min(5).max(2_000),
  orderId: z.string().trim().regex(/^[A-Za-z0-9_-]{6,64}$/).optional(),
}).strict();

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INQUIRY" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "UNAVAILABLE" }, { status: 503 });

  const { error } = await admin.from("support_inquiries").insert({
    order_id: parsed.data.orderId ?? null,
    category: parsed.data.category,
    contact: parsed.data.contact,
    message: parsed.data.message,
  });
  if (error) {
    return NextResponse.json({ error: "INQUIRY_SAVE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, {
    headers: { "Cache-Control": "no-store" },
  });
}
