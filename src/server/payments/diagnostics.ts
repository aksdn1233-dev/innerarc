import { resolvePublicAppUrl } from "@/core/site-url";
import { getSupabasePublicConfig, isPublishableSupabaseKey } from "@/lib/supabase/config";
import {
  DEFAULT_PAYAPP_METHODS,
  inspectCatalogPrices,
  inspectPayAppMethods,
  inspectPaymentReadiness,
  isLaunchApproved,
  payAppMethodNames,
  type LaunchApproval,
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
  | "UNAPPROVED"
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

const REASON_SUMMARY: Readonly<Record<PaymentSetupReason, string>> = {
  OPEN: "결제를 받을 수 있는 상태입니다.",
  DISABLED: "PAYMENTS_PROVIDER가 비어 있어 결제 경로 자체가 꺼져 있습니다.",
  UNAPPROVED: "결제 설정은 갖춰졌지만 판매 개시 승인이 없어 닫혀 있습니다.",
  INCOMPLETE: "결제사 연동에 필요한 값이 아직 비어 있습니다.",
  INVALID: "입력된 결제 설정 값의 형식이나 금액이 카탈로그와 맞지 않습니다.",
  SALES_PAUSED: "설정은 정상이지만 관리자 화면에서 신규 결제 접수를 꺼 두었습니다.",
  DATABASE_UNAVAILABLE: "주문을 저장할 데이터베이스에 연결하지 못했습니다.",
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
        title: "페이앱 연동 값",
        status: "missing",
        detail: `${empty.join(", ")} 값이 비어 있습니다.`,
        variables,
        remedy: "페이앱 관리자 > 연동 정보의 판매자 아이디, 연동 KEY, 연동 VALUE를 배포 환경에 입력하세요.",
      };
    }
    // Judged by the same schema the runtime uses, so this never reports ready for a
    // value the payment path would reject. Every input that has its own row is
    // neutralised first: a stale price must not make working credentials read as
    // malformed.
    const shaped = inspectPaymentReadiness(
      {
        ...environment,
        PAYMENTS_LAUNCH_APPROVED: "true",
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
        title: "페이앱 연동 값",
        status: "invalid",
        detail: "값은 입력되어 있으나 형식이 올바르지 않습니다.",
        variables,
        remedy: "판매자 아이디는 3자 이상, 연동 KEY와 VALUE는 8자 이상이어야 합니다. 앞뒤 공백과 줄바꿈을 지우고 다시 입력하세요.",
      };
    }
    return {
      id: "credentials",
      title: "페이앱 연동 값",
      status: "ok",
      detail: "판매자 아이디, 연동 KEY, 연동 VALUE가 모두 등록되어 있습니다.",
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
      title: "포트원 연동 값",
      status: empty.length > 0 ? "missing" : "ok",
      detail: empty.length > 0 ? `${empty.join(", ")} 값이 비어 있습니다.` : "포트원 상점·채널·시크릿이 등록되어 있습니다.",
      variables,
      remedy: empty.length > 0 ? "포트원 콘솔의 상점 ID, KPN 채널 키, API 시크릿, 웹훅 시크릿을 입력하세요." : null,
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
      title: "입금 계좌 정보",
      status: hasJson || hasLegacy ? "ok" : "missing",
      detail: hasJson || hasLegacy ? "입금 받을 계좌가 등록되어 있습니다." : "입금 계좌 정보가 비어 있습니다.",
      variables,
      remedy: hasJson || hasLegacy ? null : "은행명, 계좌번호, 예금주를 입력하세요.",
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
    title: "토스페이먼츠 연동 값",
    status: empty.length > 0 ? "missing" : wrongMode ? "invalid" : "ok",
    detail: empty.length > 0
      ? `${empty.join(", ")} 값이 비어 있습니다.`
      : wrongMode
        ? "운영 환경에는 test_ 키를 사용할 수 없습니다."
        : "클라이언트 키, 시크릿 키, 고객키 솔트가 등록되어 있습니다.",
    variables,
    remedy: empty.length > 0
      ? "토스페이먼츠 키와 32자 이상의 고객키 솔트를 입력하세요."
      : wrongMode
        ? "운영 배포에는 live_ck_ / live_sk_ 키를 입력하세요."
        : null,
  };
}

/**
 * A secret-free description of every condition production checkout depends on.
 * `launchApproval`, `salesEnabled`, and `databaseReachable` come from the caller
 * because they are runtime state rather than configuration.
 */
export function describePaymentSetup(input: Readonly<{
  environment?: Readonly<Record<string, string | undefined>>;
  runtimeMode?: PaymentRuntimeMode;
  launchApproval: LaunchApproval;
  salesEnabled: boolean;
  databaseReachable: boolean;
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
  const approved = isLaunchApproved(input.launchApproval);
  const readiness = inspectPaymentReadiness(
    environment,
    runtimeMode,
    input.launchApproval.ownerConsole,
  );
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
  const prices = inspectCatalogPrices(environment);
  const checks: PaymentSetupCheck[] = [];

  checks.push({
    id: "provider",
    title: "결제 경로 선택",
    status: provider === "disabled"
      ? "missing"
      : (SUPPORTED_PROVIDERS as readonly string[]).includes(provider)
        ? "ok"
        : "invalid",
    detail: provider === "disabled"
      ? "PAYMENTS_PROVIDER가 비어 있어 결제가 꺼져 있습니다."
      : (SUPPORTED_PROVIDERS as readonly string[]).includes(provider)
        ? `현재 결제 경로는 ${provider} 입니다.`
        : `${provider} 는 지원하지 않는 값입니다.`,
    variables: ["PAYMENTS_PROVIDER"],
    remedy: (SUPPORTED_PROVIDERS as readonly string[]).includes(provider)
      ? null
      : "PAYMENTS_PROVIDER 를 payapp, portone, manual_transfer, toss 중 하나로 설정하세요.",
  });

  checks.push({
    id: "launch_approval",
    title: "판매 개시 승인",
    status: runtimeMode !== "production" || approved ? "ok" : "missing",
    detail: runtimeMode !== "production"
      ? "개발·테스트 환경에서는 승인 없이도 결제 경로를 확인할 수 있습니다."
      : input.launchApproval.environment
        ? "PAYMENTS_LAUNCH_APPROVED=true 로 승인되어 있습니다."
        : input.launchApproval.ownerConsole
          ? "관리자 화면에서 판매 개시를 승인해 두었습니다."
          : "판매 개시 승인이 없어 결제가 닫혀 있습니다.",
    variables: ["PAYMENTS_LAUNCH_APPROVED"],
    remedy: runtimeMode !== "production" || approved
      ? null
      : "아래 ‘판매 개시 승인’을 켜거나, 배포 환경에 PAYMENTS_LAUNCH_APPROVED=true 를 설정하세요.",
  });

  checks.push(providerCredentialCheck(provider, environment, runtimeMode));

  if (provider === "payapp") {
    const methods = inspectPayAppMethods(environment);
    checks.push({
      id: "methods",
      title: "노출 결제수단",
      status: methods.ok ? "ok" : "invalid",
      detail: methods.ok
        ? environment.PAYAPP_OPEN_PAY_TYPES?.trim()
          ? `노출 설정: ${methods.methods}`
          : `기본값(${DEFAULT_PAYAPP_METHODS})을 사용합니다.`
        : methods.unknown.length > 0
          ? `${methods.unknown.join(", ")} 는 페이앱 결제수단이 아닙니다.`
          : "노출할 결제수단이 하나도 없습니다.",
      variables: ["PAYAPP_OPEN_PAY_TYPES"],
      remedy: methods.ok
        ? null
        : `${payAppMethodNames.join(", ")} 중에서 쉼표로 구분해 입력하세요.`,
    });
  }

  checks.push({
    id: "prices",
    title: "판매 금액",
    status: prices.ok ? "ok" : "invalid",
    detail: prices.ok
      ? `상세 리딩 ${prices.comprehensivePrice.toLocaleString("ko-KR")}원, 프리미엄 ${prices.premiumPdfPrice.toLocaleString("ko-KR")}원으로 판매합니다.`
      : `${prices.mismatched.map((issue) => `${issue.variable}(현재 상품 가격 ${issue.expected.toLocaleString("ko-KR")}원)`).join(", ")} 값이 상품 카탈로그와 다릅니다.`,
    variables: ["INNERARC_COMPREHENSIVE_PRICE_KRW", "INNERARC_PREMIUM_PDF_PRICE_KRW"],
    remedy: prices.ok
      ? null
      : "배포 환경의 과거 가격 값을 지우거나 현재 상품 가격과 같게 맞추세요. 값을 지우면 상품 카탈로그 가격이 그대로 적용됩니다.",
  });

  // Split out because a malformed browser key is a build-time failure with a very
  // different remedy from an unreachable database, and the two used to be one row.
  const keyMalformed = Boolean(publishableKey) && !isPublishableSupabaseKey(publishableKey!);
  checks.push({
    id: "supabase_public",
    title: "Supabase 공개 설정",
    status: !publishableKey && !environment.NEXT_PUBLIC_SUPABASE_URL?.trim()
      ? "missing"
      : keyMalformed || supabasePublicError
        ? "invalid"
        : "ok",
    detail: !publishableKey && !environment.NEXT_PUBLIC_SUPABASE_URL?.trim()
      ? "Supabase 주소와 공개 키가 비어 있어 로그인과 계정 동기화가 꺼져 있습니다."
      : keyMalformed
        ? publishableKey!.startsWith("sb_secret_")
          ? "공개 키 자리에 서비스 역할 키가 들어가 있습니다. 이 값은 브라우저로 전달되므로 즉시 교체해야 합니다."
          : "공개 키 형식이 올바르지 않습니다. sb_publishable_ 로 시작하는 키 또는 기존 anon 키만 사용할 수 있습니다."
        : supabasePublicError
          ? "Supabase 주소와 공개 키 중 하나가 비어 있거나 형식이 올바르지 않습니다."
          : "Supabase 주소와 공개 키가 정상입니다.",
    variables: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
    remedy: keyMalformed || supabasePublicError
      ? "Supabase 대시보드 > Project Settings > API Keys 의 publishable(또는 anon) 키를 그대로 붙여넣으세요. service_role 키는 절대 NEXT_PUBLIC_ 변수에 넣지 마세요."
      : null,
  });

  checks.push({
    id: "database",
    title: "주문 데이터베이스",
    status: input.databaseReachable ? "ok" : "missing",
    detail: input.databaseReachable
      ? "주문과 리포트를 저장할 수 있습니다."
      : "Supabase 서비스 역할 키 또는 공개 설정이 없어 주문을 저장할 수 없습니다.",
    variables: ["SUPABASE_SERVICE_ROLE_KEY"],
    remedy: input.databaseReachable
      ? null
      : "Supabase URL, publishable key, service-role key를 모두 배포 환경에 입력하세요.",
  });

  checks.push({
    id: "app_url",
    title: "운영 도메인",
    status: appUrl
      ? (runtimeMode === "production" && appUrl.protocol !== "https:" ? "invalid" : "ok")
      : "invalid",
    detail: appUrl
      ? `콜백 기준 주소: ${appUrl.origin}`
      : "NEXT_PUBLIC_APP_URL 값이 올바른 주소가 아닙니다.",
    variables: ["NEXT_PUBLIC_APP_URL", "APP_HTTPS_ONLY"],
    remedy: appUrl && !(runtimeMode === "production" && appUrl.protocol !== "https:")
      ? null
      : "NEXT_PUBLIC_APP_URL 을 https://운영도메인 형식으로 설정한 뒤 다시 빌드·배포하세요.",
  });

  checks.push({
    id: "admin_emails",
    title: "관리자 계정",
    status: presence(environment.ADMIN_EMAILS) === "set" ? "ok" : "missing",
    detail: presence(environment.ADMIN_EMAILS) === "set"
      ? "관리자 로그인 이메일이 등록되어 있습니다."
      : "ADMIN_EMAILS 가 비어 있으면 이 화면에 다시 들어올 수 없습니다.",
    variables: ["ADMIN_EMAILS"],
    remedy: presence(environment.ADMIN_EMAILS) === "set"
      ? null
      : "관리자 이메일을 쉼표로 구분해 ADMIN_EMAILS 에 입력하세요.",
  });

  checks.push({
    id: "sales_switch",
    title: "신규 결제 접수",
    status: input.salesEnabled ? "ok" : "missing",
    detail: input.salesEnabled
      ? "신규 주문을 접수하고 있습니다."
      : "관리자 화면에서 신규 결제 접수를 꺼 두었습니다.",
    variables: [],
    remedy: input.salesEnabled ? null : "위 ‘기본 운영 설정’에서 신규 결제 접수를 켜세요.",
  });

  if (appUrl && provider === "payapp") {
    checks.push({
      id: "callbacks",
      title: "페이앱에 등록할 주소",
      status: "info",
      detail: `피드백 URL은 결제 승인이 서버에 반영되는 유일한 경로입니다. 공개망에서 열려 있어야 합니다.`,
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
