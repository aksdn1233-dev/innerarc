import { createHmac } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export type SensitiveLimitDecision = Readonly<{
  allowed: boolean;
  configured: boolean;
  retryAfterSeconds: number;
}>;

function abuseSecret(environment: Readonly<Record<string, string | undefined>>): string | null {
  const value = environment.ABUSE_HASH_SECRET?.trim();
  return value && value.length >= 32 ? value : null;
}
export function summarizeUserAgent(value: string | null): string {
  if (!value) return "unknown";
  const normalized = value.replace(/[\u0000-\u001F\u007F]/gu, " ").replace(/\s+/gu, " ").trim();
  return Array.from(normalized).slice(0, 160).join("");
}

export function pseudonymousSecurityRef(
  kind: "account" | "ip",
  value: string | null | undefined,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): string | null {
  const secret = abuseSecret(environment);
  if (!secret || !value) return null;
  return `${kind}_${createHmac("sha256", secret).update(`${kind}:${value}`).digest("hex").slice(0, 32)}`;
}

function requestIp(request: Request): string | null {
  return request.headers.get("cf-connecting-ip")?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || null;
}

export async function enforceSensitiveRequestLimit(input: {
  admin: SupabaseClient | null;
  request: Request;
  userId: string;
  endpoint: string;
  accountLimit: number;
  ipLimit: number;
  windowSeconds: number;
}): Promise<SensitiveLimitDecision> {
  const accountRef = pseudonymousSecurityRef("account", input.userId);
  const ipRef = pseudonymousSecurityRef("ip", requestIp(input.request));
  if (!input.admin || !accountRef || !ipRef) {
    return { allowed: true, configured: false, retryAfterSeconds: input.windowSeconds };
  }

  const consume = async (scopeRef: string, limit: number) => {
    const { data, error } = await input.admin!.rpc("consume_security_rate_limit", {
      p_scope_hash: scopeRef,
      p_endpoint: input.endpoint,
      p_window_seconds: input.windowSeconds,
      p_limit: limit,
    });
    if (error || typeof data !== "boolean") return null;
    return data;
  };
  const [accountAllowed, ipAllowed] = await Promise.all([
    consume(accountRef, input.accountLimit),
    consume(ipRef, input.ipLimit),
  ]);
  if (accountAllowed === null || ipAllowed === null) {
    return { allowed: true, configured: false, retryAfterSeconds: input.windowSeconds };
  }
  const allowed = accountAllowed && ipAllowed;
  if (!allowed) {
    await input.admin.from("security_abuse_events").insert({
      event_type: "rate_limit_violation",
      account_ref: accountRef,
      ip_ref: ipRef,
      endpoint: input.endpoint,
      request_count: 1,
      user_agent_summary: summarizeUserAgent(input.request.headers.get("user-agent")),
      decision: "deny",
    });
  }
  return { allowed, configured: true, retryAfterSeconds: input.windowSeconds };
}
