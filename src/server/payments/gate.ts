import type { SupabaseClient } from "@supabase/supabase-js";
import { readEnvironmentLaunchApproval, type LaunchApproval } from "./config";

// Runtime operating state that lives in the database rather than the environment, so
// the owner can act on it without a rebuild.
//
// Every read here is written to survive a database that is one migration behind the
// code. A deploy must never be able to take checkout down just because a column it
// asks for does not exist yet, so a failed read degrades to a defined default instead
// of throwing: the operational switch fails *open* (a settings hiccup must not stop a
// paying customer, matching the checkout rate limiter), and the money gate fails
// *closed* (an unreadable approval is not an approval).

export type OperationsGate = Readonly<{
  salesEnabled: boolean;
  launchApprovedByOwner: boolean;
  approvedAt: string | null;
  /** The settings row could be read at all. */
  reachable: boolean;
  /**
   * The database's own words when the read failed. Surfaced because "unreachable"
   * covers causes with completely different fixes — a rejected key, a disabled key,
   * a missing table — and collapsing them cost a full debugging round.
   */
  error: string | null;
  /** The launch-approval columns exist, so console approval can be stored. */
  migrated: boolean;
}>;

export const DEFAULT_OPERATIONS_GATE: OperationsGate = {
  salesEnabled: true,
  launchApprovedByOwner: false,
  approvedAt: null,
  reachable: false,
  error: null,
  migrated: false,
};

type SettingsRow = Readonly<{
  sales_enabled?: boolean | null;
  payments_launch_approved?: boolean | null;
  payments_launch_approved_at?: string | null;
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
 * The current operating switches. Falls back to `sales_enabled` alone when the launch
 * approval column has not been migrated yet, and to the safe default when neither read
 * succeeds.
 */
export async function readOperationsGate(
  admin: SupabaseClient | null,
): Promise<OperationsGate> {
  if (!admin) return DEFAULT_OPERATIONS_GATE;

  const full = await selectSettings(
    admin,
    "sales_enabled,payments_launch_approved,payments_launch_approved_at",
  );
  // A timeout is not evidence that the column is missing, so it never pays for a
  // second wait; only a query error falls through to the pre-migration shape.
  if (isFailure(full) && full.timedOut) {
    return { ...DEFAULT_OPERATIONS_GATE, error: full.message };
  }
  if (!isFailure(full)) {
    return {
      salesEnabled: full?.sales_enabled ?? true,
      launchApprovedByOwner: full?.payments_launch_approved === true,
      approvedAt: full?.payments_launch_approved_at ?? null,
      reachable: true,
      error: null,
      migrated: true,
    };
  }

  const legacy = await selectSettings(admin, "sales_enabled");
  if (!isFailure(legacy)) {
    return {
      salesEnabled: legacy?.sales_enabled ?? true,
      launchApprovedByOwner: false,
      approvedAt: null,
      reachable: true,
      error: null,
      migrated: false,
    };
  }
  // Both reads failed the same way, so the second message is the honest one: it is not
  // about a column this deployment may not have yet.
  return { ...DEFAULT_OPERATIONS_GATE, error: legacy.message };
}

export function launchApprovalFrom(
  gate: OperationsGate,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): LaunchApproval {
  return {
    environment: readEnvironmentLaunchApproval(environment),
    ownerConsole: gate.launchApprovedByOwner,
  };
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
