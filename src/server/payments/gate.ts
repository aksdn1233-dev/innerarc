import type { SupabaseClient } from "@supabase/supabase-js";

// Runtime operating state that lives in the database rather than the environment, so
// the owner can act on it without a rebuild.
//
// A failed settings read degrades to a defined default instead of throwing. The
// operational pause switch fails open so a settings outage cannot stop a buyer.

export type OperationsGate = Readonly<{
  salesEnabled: boolean;
  /** The settings row could be read at all. */
  reachable: boolean;
  /**
   * The database's own words when the read failed. Surfaced because "unreachable"
   * covers causes with completely different fixes — a rejected key, a disabled key,
   * a missing table — and collapsing them cost a full debugging round.
   */
  error: string | null;
}>;

export const DEFAULT_OPERATIONS_GATE: OperationsGate = {
  salesEnabled: true,
  reachable: false,
  error: null,
};

type SettingsRow = Readonly<{
  sales_enabled?: boolean | null;
}>;

/**
 * A page render must not be able to wait on the database indefinitely. Without this
 * bound, an unresponsive Supabase turns every product page into a hanging request
 * rather than a page that quietly falls back to its defaults.
 */
const SETTINGS_READ_TIMEOUT_MS = 3_000;

async function withTimeout<T>(work: Promise<T>, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), SETTINGS_READ_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

type SettingsFailure = Readonly<{ failed: true; message: string; timedOut: boolean }>;
type SettingsRead = SettingsRow | null | SettingsFailure;

function isFailure(read: SettingsRead): read is SettingsFailure {
  return read !== null && "failed" in read;
}

const TIMED_OUT: SettingsFailure = {
  failed: true,
  message: "데이터베이스 응답이 3초를 넘겨 중단했습니다.",
  timedOut: true,
};

async function selectSettings(
  admin: SupabaseClient,
  columns: string,
): Promise<SettingsRead> {
  const query = (async (): Promise<SettingsRead> => {
    const { data, error } = await admin
      .from("admin_settings")
      .select(columns)
      .eq("id", 1)
      .maybeSingle();
    if (error) {
      return {
        failed: true,
        message: [error.code, error.message].filter(Boolean).join(": ").slice(0, 300),
        timedOut: false,
      };
    }
    return (data ?? null) as SettingsRow | null;
  })().catch((cause: unknown) => ({
    failed: true,
    message: (cause instanceof Error ? cause.message : String(cause)).slice(0, 300),
    timedOut: false,
  }) as SettingsFailure);
  return withTimeout<SettingsRead>(query, TIMED_OUT);
}

/**
 * Reads the operational pause switch. Checkout configuration and provider credentials
 * decide whether payment is available; there is no separate launch approval gate.
 */
export async function readOperationsGate(
  admin: SupabaseClient | null,
): Promise<OperationsGate> {
  if (!admin) return DEFAULT_OPERATIONS_GATE;

  const settings = await selectSettings(admin, "sales_enabled");
  if (!isFailure(settings)) {
    return {
      salesEnabled: settings?.sales_enabled ?? true,
      reachable: true,
      error: null,
    };
  }
  return { ...DEFAULT_OPERATIONS_GATE, error: settings.message };
}

export type PaymentSetupEventStage =
  | "provider_request"
  | "provider_cancel"
  | "callback";

/**
 * Records why a provider call failed, so the operator can read the payment company's
 * own wording in the console instead of only seeing a generic checkout error. Stores
 * a bounded message and never any credential. Best effort by design: a failure to log
 * must not change what the customer's request returns.
 */
export async function recordPaymentSetupEvent(
  admin: SupabaseClient | null,
  event: Readonly<{
    provider: string;
    stage: PaymentSetupEventStage;
    code: string;
    message?: string | null;
    orderId?: string | null;
  }>,
): Promise<void> {
  if (!admin) return;
  try {
    await admin.from("payment_setup_events").insert({
      provider: event.provider.slice(0, 40),
      stage: event.stage,
      code: event.code.slice(0, 80),
      message: (event.message ?? "").slice(0, 500),
      order_id: event.orderId ?? null,
    });
  } catch {
    // The table may not be migrated yet, or the write may fail. Either way the caller's
    // own error handling is what the customer sees.
  }
}

export type PaymentSetupEvent = Readonly<{
  id: number;
  created_at: string;
  provider: string;
  stage: string;
  code: string;
  message: string;
  order_id: string | null;
}>;

/** The most recent provider failures, or an empty list when the table is unavailable. */
export async function readRecentPaymentSetupEvents(
  admin: SupabaseClient | null,
  limit = 10,
): Promise<readonly PaymentSetupEvent[]> {
  if (!admin) return [];
  const query = (async () => {
    const { data, error } = await admin
      .from("payment_setup_events")
      .select("id,created_at,provider,stage,code,message,order_id")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as unknown as readonly PaymentSetupEvent[];
  })().catch(() => []);
  return withTimeout<readonly PaymentSetupEvent[]>(query, []);
}
