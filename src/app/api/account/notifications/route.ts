import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSupabaseUser } from "@/lib/supabase/auth";

const bodySchema = z.object({
  inAppEnabled: z.boolean(),
  cautionReminders: z.boolean(),
  emailEnabled: z.boolean(),
}).strict();

export async function PUT(request: Request) {
  const auth = await requireSupabaseUser();
  if (auth.error || !auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "AUTH_REQUIRED" ? 401 : 503 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_NOTIFICATION_SETTINGS" }, { status: 400 });
  }
  const { error } = await auth.client.from("notification_preferences").upsert({
    owner_user_id: auth.user.id,
    in_app_enabled: parsed.data.inAppEnabled,
    caution_reminders: parsed.data.cautionReminders,
    email_enabled: parsed.data.emailEnabled,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    return NextResponse.json({ error: "NOTIFICATION_SETTINGS_FAILED" }, { status: 500 });
  }
  return NextResponse.json({ saved: true });
}
