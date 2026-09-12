import { DreamInputSchema, hydrateAccountDreamEvents, interpretDream } from "@/core/dreams";
import { DreamAccessError, dreamAccess, dreamResponse, safeDream } from "@/server/dreams/access";
import { dreamAIConfig } from "@/server/dreams/config";
import { extractDreamWithFallback, OpenAIDreamUnderstandingProvider } from "@/server/dreams/provider";

export const POST = (request: Request) => safeDream(async () => {
  const ctx = await dreamAccess(request, true);
  const raw = await request.text();
  if (raw.length > 12_000) throw new DreamAccessError("REQUEST_TOO_LARGE", 413);
  const input = DreamInputSchema.parse(JSON.parse(raw));
  const providerConfig = input.allowRemoteAI ? dreamAIConfig() : null;
  const provider = providerConfig ? new OpenAIDreamUnderstandingProvider(providerConfig) : null;
  const [patterns, checks, events, followUps, revisions, extraction] = await Promise.all([ctx.client.from("pattern_hypotheses")
    .select("source_system,source_reference,hypothesis_text")
    .eq("owner_user_id", ctx.owner)
    .in("source_system", ["saju", "numerology"])
    .order("updated_at", { ascending: false })
    .limit(5),
  ctx.client.from("pattern_reality_checks").select("response").eq("owner_user_id", ctx.owner).order("created_at", { ascending: false }).limit(5),
  ctx.client.from("dream_events").select("*").eq("owner_user_id", ctx.owner).order("dream_date", { ascending: false }).limit(100),
  ctx.client.from("dream_followups").select("*").eq("owner_user_id", ctx.owner).order("due_date").limit(300),
  ctx.client.from("dream_interpretation_revisions").select("*").eq("owner_user_id", ctx.owner).order("revision").limit(300),
  extractDreamWithFallback(input, provider, { maxCostMicros: providerConfig?.maxCostMicros })]);
  if (patterns.error && !["42P01", "PGRST205"].includes(patterns.error.code ?? "")) throw new DreamAccessError("PATTERN_STORAGE_UNAVAILABLE", 503);
  if (events.error || followUps.error || revisions.error) throw new DreamAccessError("DREAM_HISTORY_UNAVAILABLE", 503);
  const symbolicPatterns = (patterns.data ?? []).flatMap((row) => row.source_system === "saju" || row.source_system === "numerology" ? [{ system: row.source_system, summary: String(row.hypothesis_text).slice(0, 500), sourceReference: String(row.source_reference).slice(0, 240) }] : []);
  const recentRealityChecks = (checks.data ?? []).flatMap((row) => ["MATCH", "PARTIAL", "MISMATCH", "CONTEXT_DEPENDENT"].includes(String(row.response)) ? [{ response: row.response as "MATCH" | "PARTIAL" | "MISMATCH" | "CONTEXT_DEPENDENT" }] : []);
  const history = hydrateAccountDreamEvents({ events: events.data ?? [], followUps: followUps.data ?? [], revisions: revisions.data ?? [] });
  return dreamResponse({
    interpretation: interpretDream(input, history, { symbolicPatterns, recentRealityChecks }, extraction.output),
    context: { linkedSymbolicPatterns: symbolicPatterns.length, linkedRealityChecks: recentRealityChecks.length, comparedDreams: history.length },
    ai: { used: extraction.providerUsed, fallback: extraction.fallback, provider: extraction.providerUsed ? provider?.providerAlias ?? null : null, model: extraction.providerUsed ? provider?.modelAlias ?? null : null, attempts: extraction.attempts, usage: extraction.usage },
  });
});
