import { NextResponse } from "next/server";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { enforceSensitiveRequestLimit } from "@/server/abuse-protection";

export async function GET(request: Request) {
  const auth = await requireSupabaseUser();
  if (auth.error || !auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "AUTH_REQUIRED" ? 401 : 503 });
  }
  const admin = resolveSupabaseAdminClient().client;
  const limit = await enforceSensitiveRequestLimit({
    admin,
    request,
    userId: auth.user.id,
    endpoint: "pattern_graph_read",
    accountLimit: 120,
    ipLimit: 240,
    windowSeconds: 60,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "TOO_MANY_REQUESTS" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }
  const owner = auth.user.id;
  const [profile, hypotheses, checks, events, revisions, edges] = await Promise.all([
    auth.client.from("pattern_profiles").select("*").eq("owner_user_id", owner).maybeSingle(),
    auth.client.from("pattern_hypotheses").select("*").eq("owner_user_id", owner).order("updated_at", { ascending: false }).limit(100),
    auth.client.from("pattern_reality_checks").select("*").eq("owner_user_id", owner).order("created_at", { ascending: false }).limit(200),
    auth.client.from("evidence_events").select("*").eq("owner_user_id", owner).order("event_date", { ascending: false }).limit(100),
    auth.client.from("confidence_revisions").select("*").eq("owner_user_id", owner).order("created_at", { ascending: false }).limit(200),
    auth.client.from("pattern_graph_edges").select("*").eq("owner_user_id", owner).order("created_at", { ascending: false }).limit(300),
  ]);
  const error = profile.error ?? hypotheses.error ?? checks.error ?? events.error ?? revisions.error ?? edges.error;
  if (error) return NextResponse.json({ error: "PATTERN_STORAGE_UNAVAILABLE" }, { status: 503 });
  return NextResponse.json({
    schemaVersion: "pattern-intelligence-1.0.0",
    profile: profile.data,
    hypotheses: hypotheses.data ?? [],
    realityChecks: checks.data ?? [],
    evidenceEvents: events.data ?? [],
    confidenceRevisions: revisions.data ?? [],
    graphEdges: edges.data ?? [],
    pagination: { hypotheses: 100, realityChecks: 200, evidenceEvents: 100, confidenceRevisions: 200, graphEdges: 300 },
  }, { headers: { "Cache-Control": "private, no-store" } });
}
