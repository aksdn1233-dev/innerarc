import { resolvePublicAppUrl } from "@/core/site-url";
import {
  getSupabasePublicConfig,
  isPublishableSupabaseKey,
  isSecretSupabaseKey,
} from "@/lib/supabase/config";
import {
  DEFAULT_PAYAPP_METHODS,
  inspectCatalogPrices,
  inspectPayAppMethods,
  inspectPaymentReadiness,
  payAppMethodNames,
  type PaymentRuntimeMode,
} from "./config";

// Checkout is deliberately fail-closed: eight independent conditions all have to hold
// before a real payment can be created. The cost of that design was that a closed
// checkout looked identical from the outside no matter which condition failed, so the
// owner could hold correct PayApp credentials and still have no way to learn that a
// price variable or the launch flag was the thing standing in the way.
//
// This module turns that single "closed" bit into a per-condition report. It reads
// configuration only to judge presence and shape: variable *names* travel to the
// administrator console, never their values.

export type PaymentSetupStatus = "ok" | "missing" | "invalid" | "info";

export type PaymentSetupCheck = Readonly<{
  id: string;
  title: string;
  status: PaymentSetupStatus;
  detail: string;
  /** Environment variable names involved. Names only, never values. */
  variables: readonly string[];
  /** The single next action, or null when nothing is required. */
  remedy: string | null;
}>;

export type PaymentSetupReason =
  | "OPEN"
  | "DISABLED"
  | "INCOMPLETE"
  | "INVALID"
  | "SALES_PAUSED"
  | "DATABASE_UNAVAILABLE";

export type PaymentSetupReport = Readonly<{
  runtimeMode: PaymentRuntimeMode;
  provider: string;
  open: boolean;
  reason: PaymentSetupReason;
  summary: string;
  checks: readonly PaymentSetupCheck[];
  blocking: readonly string[];
  callbackUrls: Readonly<{
    payAppFeedback: string | null;
    payAppReturn: string | null;
    portOneWebhook: string | null;
    authCallback: string | null;
  }>;
}>;

const SUPPORTED_PROVIDERS = ["toss", "portone", "manual_transfer", "payapp"] as const;

const REASON_SUMMARY: Readonly<Record<string, string>> = {
  OPEN: "寃곗젣瑜?諛쏆쓣 ???덈뒗 ?곹깭?낅땲??",
  DISABLED: "PAYMENTS_PROVIDER媛 鍮꾩뼱 ?덉뼱 寃곗젣 寃쎈줈 ?먯껜媛 爰쇱졇 ?덉뒿?덈떎.",
  INCOMPLETE: "寃곗젣???곕룞???꾩슂??媛믪씠 ?꾩쭅 鍮꾩뼱 ?덉뒿?덈떎.",
  INVALID: "?낅젰??寃곗젣 ?ㅼ젙 媛믪쓽 ?뺤떇?대굹 湲덉븸??移댄깉濡쒓렇? 留욎? ?딆뒿?덈떎.",
  SALES_PAUSED: "?ㅼ젙? ?뺤긽?댁?留?愿由ъ옄 ?붾㈃?먯꽌 ?좉퇋 寃곗젣 ?묒닔瑜?爰??먯뿀?듬땲??",
  DATABASE_UNAVAILABLE: "二쇰Ц????ν븷 ?곗씠?곕쿋?댁뒪???곌껐?섏? 紐삵뻽?듬땲??",
};

function presence(value: string | undefined): "set" | "empty" {
  return value?.trim() ? "set" : "empty";
}

function resolveAppUrl(environment: Readonly<Record<string, string | undefined>>): URL | null {
  try {
    return resolvePublicAppUrl(environment.NEXT_PUBLIC_APP_URL);
  } catch {
    return null;
  }
}

function providerCredentialCheck(
  provider: string,
  environment: Readonly<Record<string, string | undefined>>,
  runtimeMode: PaymentRuntimeMode,
): PaymentSetupCheck {
  if (provider === "payapp") {
    const variables = ["PAYAPP_USER_ID", "PAYAPP_LINK_KEY", "PAYAPP_LINK_VALUE"];
    const empty = variables.filter((name) => presence(environment[name]) === "empty");
    if (empty.length > 0) {
      return {
        id: "credentials",
        title: "PayApp credentials",
        status: "missing",
        detail: `${empty.join(", ")} is required for PayApp.`,
        variables,
        remedy: "Set provider credentials in environment variables: PAYAPP_USER_ID, PAYAPP_LINK_KEY, PAYAPP_LINK_VALUE.",
      };
    }
    // Judged by the same schema the runtime uses, so this never reports ready for a
    // value the payment path would reject. Every input that has its own row is
    // neutralised first: a stale price must not make working credentials read as
    // malformed.
    const shaped = inspectPaymentReadiness(
      {
        ...environment,
        PAYAPP_OPEN_PAY_TYPES: DEFAULT_PAYAPP_METHODS,
        INNERARC_COMPREHENSIVE_PRICE_KRW: "",
        INNERARC_PRO_30D_PRICE_KRW: "",
        INNERARC_PREMIUM_PDF_PRICE_KRW: "",
      },
      "development",
    );
    if (!shaped.enabled && shaped.reason === "INVALID") {
      return {
        id: "credentials",
        title: "PayApp credentials",
        status: "invalid",
        detail: "At least one PayApp value is malformed.",
        variables,
        remedy: "Use three consistent PayApp values and re-check LINK KEY and LINK VALUE.",
      };
    }
    return {
      id: "credentials",
      title: "PayApp credentials",
      status: "ok",
      detail: "PayApp LINK KEY and LINK VALUE are present.",
      variables,
      remedy: null,
    };
  }

  if (provider === "portone") {
    const variables = [
      "PORTONE_STORE_ID",
      "PORTONE_KPN_CHANNEL_KEY",
      "PORTONE_API_SECRET",
      "PORTONE_WEBHOOK_SECRET",
    ];
    const empty = variables.filter((name) => presence(environment[name]) === "empty");
    return {
      id: "credentials",
      title: "PortOne credentials",
      status: empty.length > 0 ? "missing" : "ok",
      detail: empty.length > 0
        ? `${empty.join(", ")} is required for PortOne.`
        : "PortOne is connected with the required credentials.",
      variables,
      remedy: empty.length > 0
        ? "Set PORTONE_STORE_ID, PORTONE_KPN_CHANNEL_KEY, PORTONE_API_SECRET and PORTONE_WEBHOOK_SECRET."
        : null,
    };
  }

  if (provider === "manual_transfer") {
    const variables = [
      "MANUAL_BANK_ACCOUNTS_JSON",
      "MANUAL_BANK_NAME",
      "MANUAL_BANK_ACCOUNT",
      "MANUAL_BANK_HOLDER",
    ];
    const hasJson = presence(environment.MANUAL_BANK_ACCOUNTS_JSON) === "set";
    const hasLegacy = ["MANUAL_BANK_NAME", "MANUAL_BANK_ACCOUNT", "MANUAL_BANK_HOLDER"]
      .every((name) => presence(environment[name]) === "set");
    return {
      id: "credentials",
      title: "?낃툑 怨꾩쥖 ?뺣낫",
      status: hasJson || hasLegacy ? "ok" : "missing",
      detail: hasJson || hasLegacy ? "?낃툑 諛쏆쓣 怨꾩쥖媛 ?깅줉?섏뼱 ?덉뒿?덈떎." : "?낃툑 怨꾩쥖 ?뺣낫媛 鍮꾩뼱 ?덉뒿?덈떎.",
      variables,
      remedy: hasJson || hasLegacy ? null : "??됰챸, 怨꾩쥖踰덊샇, ?덇툑二쇰? ?낅젰?섏꽭??",
    };
  }

  const variables = ["TOSS_CLIENT_KEY", "TOSS_SECRET_KEY", "TOSS_CUSTOMER_KEY_SALT"];
  const empty = variables.filter((name) => presence(environment[name]) === "empty");
  const live = runtimeMode === "production";
  const wrongMode = empty.length === 0 && live && (
    !environment.TOSS_CLIENT_KEY?.trim().startsWith("live_ck_") ||
    !environment.TOSS_SECRET_KEY?.trim().startsWith("live_sk_")
  );
  return {
    id: "credentials",
    title: "Toss credentials",
    status: empty.length > 0 ? "missing" : wrongMode ? "invalid" : "ok",
    detail: empty.length > 0
      ? `${empty.join(", ")} is required.`
      : wrongMode
        ? "Production keys must use live_ck_ and live_sk_ prefixes."
        : "Toss client credentials are set and ready.",
    variables,
    remedy: empty.length > 0
      ? "Set TOSS_CLIENT_KEY and TOSS_SECRET_KEY values, each at least 32 characters."
      : wrongMode
        ? "Replace both keys with test or live credentials as expected for your environment."
        : null,
  };
}

/**
 * A secret-free description of every condition production checkout depends on.
 * `salesEnabled` and `databaseReachable` come from the caller
 * because they are runtime state rather than configuration.
 */
export function describePaymentSetup(input: Readonly<{
  environment?: Readonly<Record<string, string | undefined>>;
  runtimeMode?: PaymentRuntimeMode;
  salesEnabled: boolean;
  databaseReachable: boolean;
  now?: Date;
  /** The database's own words when the read failed, shown verbatim to the operator. */
  databaseError?: string | null;
}>): PaymentSetupReport {
  const environment = input.environment ?? process.env;
  const runtimeMode = input.runtimeMode ?? (
    environment.NODE_ENV === "production"
      ? "production"
      : environment.NODE_ENV === "test"
        ? "test"
        : "development"
  );
  const provider = environment.PAYMENTS_PROVIDER?.trim() || "disabled";
  const now = input.now ?? new Date();
  const readiness = inspectPaymentReadiness(environment, runtimeMode, now);
  const appUrl = resolveAppUrl(environment);
  // Reading this is itself allowed to fail: a malformed browser key must be reportable
  // rather than something that throws out of the report the operator opened to find it.
  let supabasePublic: ReturnType<typeof getSupabasePublicConfig> = null;
  let supabasePublicError = false;
  try {
    supabasePublic = getSupabasePublicConfig(environment);
  } catch {
    supabasePublicError = true;
  }
  const publishableKey = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const prices = inspectCatalogPrices(environment, now);
  const checks: PaymentSetupCheck[] = [];

  checks.push({
    id: "provider",
    title: "寃곗젣 寃쎈줈 ?좏깮",
    status: provider === "disabled"
      ? "missing"
      : (SUPPORTED_PROVIDERS as readonly string[]).includes(provider)
        ? "ok"
        : "invalid",
    detail: provider === "disabled"
      ? "PAYMENTS_PROVIDER媛 鍮꾩뼱 ?덉뼱 寃곗젣媛 爰쇱졇 ?덉뒿?덈떎."
      : (SUPPORTED_PROVIDERS as readonly string[]).includes(provider)
        ? `?꾩옱 寃곗젣 寃쎈줈??${provider} ?낅땲??`
        : `${provider} ??吏?먰븯吏 ?딅뒗 媛믪엯?덈떎.`,
    variables: ["PAYMENTS_PROVIDER"],
    remedy: (SUPPORTED_PROVIDERS as readonly string[]).includes(provider)
      ? null
      : "PAYMENTS_PROVIDER 瑜?payapp, portone, manual_transfer, toss 以??섎굹濡??ㅼ젙?섏꽭??",
  });

  checks.push(providerCredentialCheck(provider, environment, runtimeMode));

  if (provider === "payapp") {
    const methods = inspectPayAppMethods(environment);
    checks.push({
      id: "methods",
      title: "?몄텧 寃곗젣?섎떒",
      status: methods.ok ? "ok" : "invalid",
      detail: methods.ok
        ? environment.PAYAPP_OPEN_PAY_TYPES?.trim()
          ? `?몄텧 ?ㅼ젙: ${methods.methods}`
          : `湲곕낯媛?${DEFAULT_PAYAPP_METHODS})???ъ슜?⑸땲??`
        : methods.unknown.length > 0
          ? `${methods.unknown.join(", ")} ???섏씠??寃곗젣?섎떒???꾨떃?덈떎.`
          : "?몄텧??寃곗젣?섎떒???섎굹???놁뒿?덈떎.",
      variables: ["PAYAPP_OPEN_PAY_TYPES"],
      remedy: methods.ok
        ? null
        : `${payAppMethodNames.join(", ")} 以묒뿉???쇳몴濡?援щ텇???낅젰?섏꽭??`,
    });
  }

  checks.push({
    id: "prices",
    title: "Product prices",
    status: prices.ok ? "ok" : "invalid",
    detail: prices.ok
      ? `Current catalog prices are ${prices.comprehensivePrice.toLocaleString("en-US")} and ${prices.premiumPdfPrice.toLocaleString("en-US")}.`
      : `Mismatch for ${prices.mismatched.map((issue) => `${issue.variable}(expected ${issue.expected.toLocaleString("en-US")})`).join(", ")}.`,
    variables: ["INNERARC_COMPREHENSIVE_PRICE_KRW", "INNERARC_PREMIUM_PDF_PRICE_KRW"],
    remedy: prices.ok
      ? null
      : `Set the price variables to catalog values: ${prices.mismatched.map((issue) => issue.variable).join(", ")}.`,
  });
  // Split out because a malformed browser key is a build-time failure with a very
  // different remedy from an unreachable database, and the two used to be one row.
  const keyMalformed = Boolean(publishableKey) && !isPublishableSupabaseKey(publishableKey!);
  checks.push({
    id: "supabase_public",
    title: "Supabase 怨듦컻 ?ㅼ젙",
    status: !publishableKey && !environment.NEXT_PUBLIC_SUPABASE_URL?.trim()
      ? "missing"
      : keyMalformed || supabasePublicError
        ? "invalid"
        : "ok",
    detail: !publishableKey && !environment.NEXT_PUBLIC_SUPABASE_URL?.trim()
      ? "Supabase 二쇱냼? 怨듦컻 ?ㅺ? 鍮꾩뼱 ?덉뼱 濡쒓렇?멸낵 怨꾩젙 ?숆린?붽? 爰쇱졇 ?덉뒿?덈떎."
      : keyMalformed
        ? publishableKey!.startsWith("sb_secret_")
          ? "怨듦컻 ???먮━???쒕퉬????븷 ?ㅺ? ?ㅼ뼱媛 ?덉뒿?덈떎. ??媛믪? 釉뚮씪?곗?濡??꾨떖?섎?濡?利됱떆 援먯껜?댁빞 ?⑸땲??"
          : "怨듦컻 ???뺤떇???щ컮瑜댁? ?딆뒿?덈떎. sb_publishable_ 濡??쒖옉?섎뒗 ???먮뒗 湲곗〈 anon ?ㅻ쭔 ?ъ슜?????덉뒿?덈떎."
        : supabasePublicError
          ? "Supabase 二쇱냼? 怨듦컻 ??以??섎굹媛 鍮꾩뼱 ?덇굅???뺤떇???щ컮瑜댁? ?딆뒿?덈떎."
          : "Supabase 二쇱냼? 怨듦컻 ?ㅺ? ?뺤긽?낅땲??",
    variables: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
    remedy: keyMalformed || supabasePublicError
      ? "Supabase ??쒕낫??> Project Settings > API Keys ??publishable(?먮뒗 anon) ?ㅻ? 洹몃?濡?遺숈뿬?ｌ쑝?몄슂. service_role ?ㅻ뒗 ?덈? NEXT_PUBLIC_ 蹂?섏뿉 ?ｌ? 留덉꽭??"
      : null,
  });

  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const serviceRoleMalformed = Boolean(serviceRoleKey) && !isSecretSupabaseKey(serviceRoleKey!);
  checks.push({
    id: "database",
    title: "二쇰Ц ?곗씠?곕쿋?댁뒪",
    status: input.databaseReachable ? "ok" : serviceRoleMalformed ? "invalid" : "missing",
    detail: input.databaseReachable
      ? "二쇰Ц怨?由ы룷?몃? ??ν븷 ???덉뒿?덈떎."
      : serviceRoleMalformed
        ? serviceRoleKey!.startsWith("sb_publishable_") ||
          isPublishableSupabaseKey(serviceRoleKey!)
          ? "?쒕퉬????븷 ???먮━??怨듦컻 ?ㅺ? ?ㅼ뼱媛 ?덉뒿?덈떎. ???ㅻ줈??二쇰Ц????ν븷 ???놁뒿?덈떎."
          : "?쒕퉬????븷 ???뺤떇???щ컮瑜댁? ?딆뒿?덈떎. sb_secret_ 濡??쒖옉?섎뒗 ???먮뒗 湲곗〈 service_role ?ㅻ쭔 ?ъ슜?????덉뒿?덈떎."
        : !serviceRoleKey
          ? "SUPABASE_SERVICE_ROLE_KEY 媛믪씠 鍮꾩뼱 ?덉뼱 二쇰Ц????ν븷 ???놁뒿?덈떎."
          : input.databaseError
            ? `Supabase ?묐떟: ${input.databaseError}`
            : "?곗씠?곕쿋?댁뒪???곌껐?섏? 紐삵뻽?듬땲??",
    variables: ["SUPABASE_SERVICE_ROLE_KEY"],
    remedy: input.databaseReachable
      ? null
      : "Supabase ??쒕낫??> Project Settings > API Keys ?먯꽌 ?꾩옱 ?ъ슜 以?disabled ?꾨떂)??secret ?ㅻ? 蹂듭궗??SUPABASE_SERVICE_ROLE_KEY ???ｊ퀬 ?ㅼ떆 諛고룷?섏꽭?? ?덉쟾 service_role ?ㅻ? 鍮꾪솢?깊솕?덈떎硫?洹??ㅻ줈??401???⑸땲??",
  });

  checks.push({
    id: "app_url",
    title: "Application URL",
    status: appUrl
      ? (runtimeMode === "production" && appUrl.protocol !== "https:" ? "invalid" : "ok")
      : "invalid",
    detail: appUrl
      ? `肄쒕갚 湲곗? 二쇱냼: ${appUrl.origin}`
      : "NEXT_PUBLIC_APP_URL 媛믪씠 ?щ컮瑜?二쇱냼媛 ?꾨떃?덈떎.",
    variables: ["NEXT_PUBLIC_APP_URL", "APP_HTTPS_ONLY"],
    remedy: appUrl && !(runtimeMode === "production" && appUrl.protocol !== "https:")
      ? null
      : "NEXT_PUBLIC_APP_URL ??https://?댁쁺?꾨찓???뺤떇?쇰줈 ?ㅼ젙?????ㅼ떆 鍮뚮뱶쨌諛고룷?섏꽭??",
  });

  checks.push({
    id: "admin_emails",
    title: "愿由ъ옄 怨꾩젙",
    status: presence(environment.ADMIN_EMAILS) === "set" ? "ok" : "missing",
    detail: presence(environment.ADMIN_EMAILS) === "set"
      ? "愿由ъ옄 濡쒓렇???대찓?쇱씠 ?깅줉?섏뼱 ?덉뒿?덈떎."
      : "ADMIN_EMAILS 媛 鍮꾩뼱 ?덉쑝硫????붾㈃???ㅼ떆 ?ㅼ뼱?????놁뒿?덈떎.",
    variables: ["ADMIN_EMAILS"],
    remedy: presence(environment.ADMIN_EMAILS) === "set"
      ? null
      : "愿由ъ옄 ?대찓?쇱쓣 ?쇳몴濡?援щ텇??ADMIN_EMAILS ???낅젰?섏꽭??",
  });

  checks.push({
    id: "sales_switch",
    title: "?좉퇋 寃곗젣 ?묒닔",
    status: input.salesEnabled ? "ok" : "missing",
    detail: input.salesEnabled
      ? "?좉퇋 二쇰Ц???묒닔?섍퀬 ?덉뒿?덈떎."
      : "愿由ъ옄 ?붾㈃?먯꽌 ?좉퇋 寃곗젣 ?묒닔瑜?爰??먯뿀?듬땲??",
    variables: [],
    remedy: input.salesEnabled ? null : "???섍린蹂??댁쁺 ?ㅼ젙?숈뿉???좉퇋 寃곗젣 ?묒닔瑜?耳쒖꽭??",
  });

  if (appUrl && provider === "payapp") {
    checks.push({
      id: "callbacks",
      title: "?섏씠?깆뿉 ?깅줉??二쇱냼",
      status: "info",
      detail: `?쇰뱶諛?URL? 寃곗젣 ?뱀씤???쒕쾭??諛섏쁺?섎뒗 ?좎씪??寃쎈줈?낅땲?? 怨듦컻留앹뿉???대젮 ?덉뼱???⑸땲??`,
      variables: [],
      remedy: null,
    });
  }

  const blocking = checks
    .filter((check) => check.status === "missing" || check.status === "invalid")
    .map((check) => check.id);

  const reason: PaymentSetupReason = !input.databaseReachable
    ? "DATABASE_UNAVAILABLE"
    : readiness.enabled
      ? (input.salesEnabled ? "OPEN" : "SALES_PAUSED")
      : readiness.reason;
  const open = reason === "OPEN";

  return {
    runtimeMode,
    provider,
    open,
    reason,
    summary: REASON_SUMMARY[reason],
    checks,
    blocking,
    callbackUrls: {
      payAppFeedback: appUrl ? new URL("/api/payments/payapp/feedback", appUrl).toString() : null,
      payAppReturn: appUrl ? new URL("/api/payments/payapp/return", appUrl).toString() : null,
      portOneWebhook: appUrl ? new URL("/api/payments/portone/webhook", appUrl).toString() : null,
      authCallback: supabasePublic && appUrl
        ? new URL("/auth/callback", appUrl).toString()
        : null,
    },
  };
}
