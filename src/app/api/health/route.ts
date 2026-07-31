import { NextResponse } from "next/server";
import { resolvePublicAppUrl } from "@/core/site-url";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { inspectPaymentReadiness } from "@/server/payments/config";
import { launchApprovalFrom, readOperationsGate } from "@/server/payments/gate";

export const dynamic = "force-dynamic";

/**
 * One address that answers "is the site actually still selling?" after any change.
 * Deliberately coarse and public: it repeats only facts a visitor can already observe
 * on the product page — never a variable name, a value, or a count. The administrator
 * console is where the detail lives.
 *
 * `degraded` means the site serves pages but cannot take an order right now, which is
 * the state worth alerting on and the one that used to be invisible until a customer
 * hit it.
 */
export async function GET() {
  const startedAt = Date.now();
  let database: "ok" | "rejected" | "unreachable" | "misconfigured" | "not_configured" =
    "not_configured";
  let payments: "open" | "closed" = "closed";
  let site: "ok" | "misconfigured" = "ok";

  try {
    resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  } catch {
    site = "misconfigured";
  }

  const resolution = resolveSupabaseAdminClient();
  if (resolution.client) {
    const gate = await readOperationsGate(resolution.client);
    // A key the database refuses is the one cause an operator can act on immediately,
    // so it does not hide inside the generic "unreachable".
    const refused = /\b(401|403|JWT|PGRST301|api key|apikey|unauthor)/i.test(gate.error ?? "");
    database = gate.reachable ? "ok" : refused ? "rejected" : "unreachable";
    const readiness = inspectPaymentReadiness(
      process.env,
      undefined,
      launchApprovalFrom(gate).ownerConsole,
    );
    payments = readiness.enabled && gate.salesEnabled ? "open" : "closed";
  } else if (resolution.reason === "MISCONFIGURED") {
    // A rejected key and a database that is down need different fixes, so they are
    // never reported as the same thing.
    database = "misconfigured";
  }

  const status = site === "ok" && database === "ok" && payments === "open"
    ? "ok"
    : "degraded";

  return NextResponse.json(
    {
      status,
      site,
      database,
      payments,
      checkedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    },
    {
      // Always 200: an uptime monitor should read the body, and a non-200 here would
      // make a closed-but-healthy storefront look like an outage.
      status: 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
