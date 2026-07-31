import { NextResponse } from "next/server";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { isAdminEmail } from "@/server/admin-access";
import { describePaymentSetup } from "@/server/payments/diagnostics";
import {
  launchApprovalFrom,
  readOperationsGate,
  readRecentPaymentSetupEvents,
} from "@/server/payments/gate";

export const dynamic = "force-dynamic";

/**
 * Why checkout is open or closed, one condition at a time. Administrator-only and
 * secret-free: it reports whether each variable is set and well-formed, never its
 * value.
 */
export async function GET() {
  const auth = await requireSupabaseUser();
  if (!auth.user || !isAdminEmail(auth.user.email)) {
    return NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 });
  }
  const admin = resolveSupabaseAdminClient().client;
  const gate = await readOperationsGate(admin);
  const report = describePaymentSetup({
    launchApproval: launchApprovalFrom(gate),
    salesEnabled: gate.salesEnabled,
    databaseReachable: Boolean(admin) && gate.reachable,
  });
  const recentFailures = await readRecentPaymentSetupEvents(admin, 10);

  return NextResponse.json(
    { report, gate, recentFailures },
    { headers: { "Cache-Control": "no-store" } },
  );
}
