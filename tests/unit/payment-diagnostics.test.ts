import { describe, expect, it } from "vitest";
import { PRODUCT_PRICES_KRW } from "@/core/product-prices";
import {
  inspectCatalogPrices,
  inspectPaymentReadiness,
  isLaunchApproved,
  readEnvironmentLaunchApproval,
} from "@/server/payments/config";
import { describePaymentSetup } from "@/server/payments/diagnostics";
import { DEFAULT_OPERATIONS_GATE, launchApprovalFrom } from "@/server/payments/gate";

const payAppEnvironment = {
  PAYMENTS_REQUIRE_LAUNCH_APPROVAL: "true",
  PAYMENTS_PROVIDER: "payapp",
  PAYAPP_USER_ID: "gyeol-seller",
  PAYAPP_LINK_KEY: "link-key-secret",
  PAYAPP_LINK_VALUE: "link-value-secret",
  PAYAPP_OPEN_PAY_TYPES: "card,kakaopay,tosspay,vbank,phone,rbank",
  NEXT_PUBLIC_APP_URL: "https://gyeol.example",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: `sb_publishable_${"a".repeat(32)}`,
  SUPABASE_SERVICE_ROLE_KEY: `sb_secret_${"b".repeat(32)}`,
  ADMIN_EMAILS: "owner@example.com",
} as const;

const approvedByEnvironment = { ...payAppEnvironment, PAYMENTS_LAUNCH_APPROVED: "true" };

function describeWith(
  environment: Readonly<Record<string, string | undefined>>,
  overrides: Partial<Parameters<typeof describePaymentSetup>[0]> = {},
) {
  return describePaymentSetup({
    environment,
    runtimeMode: "production",
    launchApproval: {
      environment: readEnvironmentLaunchApproval(environment),
      ownerConsole: false,
    },
    salesEnabled: true,
    databaseReachable: true,
    ...overrides,
  });
}

function checkFor(
  report: ReturnType<typeof describePaymentSetup>,
  id: string,
) {
  const check = report.checks.find((entry) => entry.id === id);
  if (!check) throw new Error(`missing check: ${id}`);
  return check;
}

describe("catalog prices", () => {
  it("uses the code catalog when no deployment price is declared", () => {
    const prices = inspectCatalogPrices({});
    expect(prices).toEqual({
      ok: true,
      comprehensivePrice: PRODUCT_PRICES_KRW.pro_30d,
      premiumPdfPrice: PRODUCT_PRICES_KRW.premium_pdf,
    });
  });

  it("opens checkout for a provider that declares no price variables at all", () => {
    const readiness = inspectPaymentReadiness(approvedByEnvironment, "production");
    expect(readiness.enabled).toBe(true);
    if (readiness.enabled) {
      expect(readiness.config.products.pro_30d.amount).toBe(PRODUCT_PRICES_KRW.pro_30d);
      expect(readiness.config.products.premium_pdf.amount).toBe(
        PRODUCT_PRICES_KRW.premium_pdf,
      );
    }
  });

  it("still fails closed on a stale price that disagrees with the catalog", () => {
    const stale = {
      ...approvedByEnvironment,
      INNERARC_COMPREHENSIVE_PRICE_KRW: "39000",
      INNERARC_PREMIUM_PDF_PRICE_KRW: "79000",
    };
    expect(inspectPaymentReadiness(stale, "production")).toEqual({
      enabled: false,
      reason: "INVALID",
    });
    const prices = inspectCatalogPrices(stale);
    expect(prices.ok).toBe(false);
    if (!prices.ok) {
      expect(prices.mismatched.map((issue) => issue.variable)).toEqual([
        "INNERARC_COMPREHENSIVE_PRICE_KRW",
        "INNERARC_PREMIUM_PDF_PRICE_KRW",
      ]);
    }
  });

  it("names the legacy price variable when only that one is set", () => {
    const prices = inspectCatalogPrices({ INNERARC_PRO_30D_PRICE_KRW: "39000" });
    expect(prices.ok).toBe(false);
    if (!prices.ok) {
      expect(prices.mismatched[0]?.variable).toBe("INNERARC_PRO_30D_PRICE_KRW");
      expect(prices.mismatched[0]?.expected).toBe(PRODUCT_PRICES_KRW.pro_30d);
    }
  });

  it("rejects an unparseable price rather than falling back to the catalog", () => {
    expect(inspectCatalogPrices({ INNERARC_PREMIUM_PDF_PRICE_KRW: "무료" }).ok).toBe(false);
  });
});

describe("launch approval", () => {
  it("treats an administrator console approval as equal to the environment flag", () => {
    expect(inspectPaymentReadiness(payAppEnvironment, "production")).toEqual({
      enabled: false,
      reason: "UNAPPROVED",
    });
    expect(inspectPaymentReadiness(payAppEnvironment, "production", true).enabled).toBe(true);
    expect(inspectPaymentReadiness(approvedByEnvironment, "production", false).enabled)
      .toBe(true);
  });

  it("never lets credentials alone stand in for approval", () => {
    expect(isLaunchApproved({ environment: false, ownerConsole: false })).toBe(false);
    expect(inspectPaymentReadiness(payAppEnvironment, "production", false).enabled).toBe(false);
  });

  it("fails closed on an unreadable settings row", () => {
    expect(launchApprovalFrom(DEFAULT_OPERATIONS_GATE, payAppEnvironment)).toEqual({
      environment: false,
      ownerConsole: false,
    });
    expect(DEFAULT_OPERATIONS_GATE.salesEnabled).toBe(true);
  });
});

describe("payment setup diagnostics", () => {
  it("names the launch approval as the only blocker of an otherwise complete setup", () => {
    const report = describeWith(payAppEnvironment);
    expect(report.open).toBe(false);
    expect(report.reason).toBe("UNAPPROVED");
    expect(report.blocking).toEqual(["launch_approval"]);
    expect(checkFor(report, "credentials").status).toBe("ok");
    expect(checkFor(report, "prices").status).toBe("ok");
  });

  it("reports an open checkout once approval is recorded", () => {
    const report = describeWith(payAppEnvironment, {
      launchApproval: { environment: false, ownerConsole: true },
    });
    expect(report.open).toBe(true);
    expect(report.reason).toBe("OPEN");
    expect(report.blocking).toEqual([]);
  });

  it("separates a paused sales switch from a broken configuration", () => {
    const report = describeWith(approvedByEnvironment, { salesEnabled: false });
    expect(report.open).toBe(false);
    expect(report.reason).toBe("SALES_PAUSED");
    expect(checkFor(report, "sales_switch").status).toBe("missing");
  });

  it("points at the empty PayApp variable by name", () => {
    const report = describeWith({ ...approvedByEnvironment, PAYAPP_LINK_VALUE: "" });
    const credentials = checkFor(report, "credentials");
    expect(credentials.status).toBe("missing");
    expect(credentials.detail).toContain("PAYAPP_LINK_VALUE");
    expect(report.reason).toBe("INCOMPLETE");
  });

  it("points at a stale price variable by name", () => {
    const report = describeWith({
      ...approvedByEnvironment,
      INNERARC_PREMIUM_PDF_PRICE_KRW: "79000",
    });
    const prices = checkFor(report, "prices");
    expect(prices.status).toBe("invalid");
    expect(prices.detail).toContain("INNERARC_PREMIUM_PDF_PRICE_KRW");
    expect(prices.remedy).toContain("지우");
  });

  it("flags an unsupported payment method without claiming a credential problem", () => {
    const report = describeWith({
      ...approvedByEnvironment,
      PAYAPP_OPEN_PAY_TYPES: "card,not-a-method",
    });
    const methods = checkFor(report, "methods");
    expect(methods.status).toBe("invalid");
    expect(methods.detail).toContain("not-a-method");
    expect(checkFor(report, "credentials").status).toBe("ok");
    expect(report.reason).toBe("INVALID");
  });

  // Each row has to stand for exactly one condition, or the owner fixes the wrong
  // thing: the underlying readiness call collapses every shape problem into one
  // INVALID, so a row that consults it must neutralise the inputs it does not own.
  it("keeps one bad value from marking unrelated rows as broken", () => {
    const stalePrice = describeWith({
      ...approvedByEnvironment,
      INNERARC_PREMIUM_PDF_PRICE_KRW: "79000",
    });
    expect(checkFor(stalePrice, "prices").status).toBe("invalid");
    expect(checkFor(stalePrice, "credentials").status).toBe("ok");
    expect(checkFor(stalePrice, "methods").status).toBe("ok");

    const badMethods = describeWith({
      ...approvedByEnvironment,
      PAYAPP_OPEN_PAY_TYPES: "not-a-method",
    });
    expect(checkFor(badMethods, "prices").status).toBe("ok");
    expect(checkFor(badMethods, "credentials").status).toBe("ok");

    const shortSecret = describeWith({ ...approvedByEnvironment, PAYAPP_LINK_KEY: "short" });
    expect(checkFor(shortSecret, "credentials").status).toBe("invalid");
    expect(checkFor(shortSecret, "prices").status).toBe("ok");
    expect(checkFor(shortSecret, "methods").status).toBe("ok");
  });

  it("reports a disabled provider distinctly from a misconfigured one", () => {
    expect(describeWith({}).reason).toBe("DISABLED");
    expect(describeWith({ ...approvedByEnvironment, PAYMENTS_PROVIDER: "kakao" }).reason)
      .toBe("INVALID");
  });

  it("surfaces the exact callback addresses to register at the provider", () => {
    const report = describeWith(approvedByEnvironment);
    expect(report.callbackUrls.payAppFeedback)
      .toBe("https://gyeol.example/api/payments/payapp/feedback");
    expect(report.callbackUrls.payAppReturn)
      .toBe("https://gyeol.example/api/payments/payapp/return");
    expect(report.callbackUrls.authCallback).toBe("https://gyeol.example/auth/callback");
  });

  it("does not fall over on an unusable public app URL", () => {
    const report = describeWith({ ...approvedByEnvironment, NEXT_PUBLIC_APP_URL: "not a url" });
    expect(checkFor(report, "app_url").status).toBe("invalid");
    expect(report.callbackUrls.payAppFeedback).toBeNull();
  });

  it("never repeats a configured secret back to the console", () => {
    const report = describeWith(approvedByEnvironment);
    const serialized = JSON.stringify(report);
    for (const secret of [
      payAppEnvironment.PAYAPP_LINK_KEY,
      payAppEnvironment.PAYAPP_LINK_VALUE,
      payAppEnvironment.SUPABASE_SERVICE_ROLE_KEY,
      payAppEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      payAppEnvironment.ADMIN_EMAILS,
    ]) {
      expect(serialized).not.toContain(secret);
    }
  });

  it("treats an unreachable database as its own reason", () => {
    const report = describeWith(approvedByEnvironment, { databaseReachable: false });
    expect(report.reason).toBe("DATABASE_UNAVAILABLE");
    expect(checkFor(report, "database").status).toBe("missing");
  });
});
