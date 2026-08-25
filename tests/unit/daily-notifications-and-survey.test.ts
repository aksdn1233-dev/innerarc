import { readFile } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACQUISITION_SOURCES,
  AcquisitionSurveySchema,
  decodeAcquisitionSurvey,
  encodeAcquisitionSurvey,
} from "@/core/acquisition-survey";
import { createDailyFortune } from "@/core/daily-fortune";

const { getAdmin } = vi.hoisted(() => ({ getAdmin: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdminClient: getAdmin }));

import { dateKeyInTimeZone, runDailyNotificationBatch } from "@/server/daily-notifications";

describe("daily morning notifications", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the Korean calendar date at the 9 AM cron boundary", () => {
    expect(dateKeyInTimeZone(new Date("2026-08-24T23:59:59.000Z"))).toBe("2026-08-25");
    expect(dateKeyInTimeZone(new Date("2026-08-25T00:00:00.000Z"))).toBe("2026-08-25");
  });

  it("writes one deterministic, owner-scoped inbox item for each consenting preference", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const preferenceQuery = {
      select: vi.fn(), eq: vi.fn(), not: vi.fn(), limit: vi.fn(),
    };
    preferenceQuery.select.mockReturnValue(preferenceQuery);
    preferenceQuery.eq.mockReturnValue(preferenceQuery);
    preferenceQuery.not.mockReturnValue(preferenceQuery);
    preferenceQuery.limit.mockResolvedValue({
      data: [{ owner_user_id: "owner-a", daily_birth_month: 11, daily_birth_day: 4, locale: "ko" }],
      error: null,
    });
    getAdmin.mockReturnValue({
      from: (table: string) => table === "notification_preferences"
        ? preferenceQuery
        : { upsert },
    });

    const now = new Date("2026-08-25T00:00:00.000Z");
    const batch = await runDailyNotificationBatch({}, now);
    const expected = createDailyFortune({ birthMonth: 11, birthDay: 4, dateKey: "2026-08-25", locale: "ko" });

    expect(batch).toEqual({ available: true, dateKey: "2026-08-25", eligible: 1, written: 1, failed: 0 });
    expect(upsert).toHaveBeenCalledOnce();
    expect(upsert.mock.calls[0][0]).toMatchObject({
      owner_user_id: "owner-a",
      delivery_date: "2026-08-25",
      scheduled_for: "2026-08-25T09:00:00+09:00",
      title: expected.copy.title,
      rule_version: expected.ruleVersion,
    });
    expect(upsert.mock.calls[0][1]).toEqual({
      onConflict: "owner_user_id,delivery_date,notification_type",
    });
  });

  it("fails closed when account storage is unavailable", async () => {
    getAdmin.mockReturnValue(null);
    await expect(runDailyNotificationBatch({}, new Date("2026-08-25T00:00:00.000Z")))
      .resolves.toMatchObject({ available: false, written: 0 });
  });
});

describe("acquisition survey", () => {
  const completeSurvey = {
    source: "naver_search" as const,
    detail: "",
    satisfactionScore: 5 as const,
    returnIntent: "very_likely" as const,
    desiredFollowUp: "monthly_report" as const,
    preferredCadence: "monthly" as const,
  };

  it("accepts only fixed experience choices and bounds the optional source detail", () => {
    for (const source of ACQUISITION_SOURCES.filter((item) => item !== "other")) {
      expect(AcquisitionSurveySchema.parse({ ...completeSurvey, source }).source).toBe(source);
    }
    expect(() => AcquisitionSurveySchema.parse({ ...completeSurvey, source: "podcast" })).toThrow();
    expect(() => AcquisitionSurveySchema.parse({ ...completeSurvey, source: "other", detail: "" })).toThrow();
    expect(() => AcquisitionSurveySchema.parse({ ...completeSurvey, source: "other", detail: "가".repeat(41) })).toThrow();
    expect(() => AcquisitionSurveySchema.parse({ ...completeSurvey, satisfactionScore: 6 })).toThrow();
    expect(() => AcquisitionSurveySchema.parse({ ...completeSurvey, returnIntent: "always" })).toThrow();
    expect(() => AcquisitionSurveySchema.parse({ ...completeSurvey, desiredFollowUp: "investment_tip" })).toThrow();
  });

  it("round-trips a compact retention envelope inside the existing 80-character field", () => {
    const input = { ...completeSurvey, source: "other" as const, detail: "사주 카페 게시글" };
    const encoded = encodeAcquisitionSurvey(input);
    expect(encoded.length).toBeLessThanOrEqual(80);
    expect(decodeAcquisitionSurvey(input.source, encoded)).toEqual(input);
    expect(decodeAcquisitionSurvey("friend", "지인 단체방")).toMatchObject({
      source: "friend",
      detail: "지인 단체방",
      satisfactionScore: null,
      returnIntent: null,
    });
  });

  it("keeps storage behind completed-report proof and the admin view behind its allowlist", async () => {
    const route = await readFile("src/app/api/surveys/acquisition/route.ts", "utf8");
    const reportPage = await readFile("src/app/[locale]/reports/[orderId]/page.tsx", "utf8");
    const adminPage = await readFile("src/app/[locale]/admin/page.tsx", "utf8");
    const panel = await readFile("src/components/acquisition-survey-panel.tsx", "utf8");
    const storage = await readFile("src/server/acquisition-surveys.ts", "utf8");
    const accountExport = await readFile("src/app/api/account/export/route.ts", "utf8");
    expect(route).toContain("authorizeReviewForOrder");
    expect(route).toContain("isSameOriginRequest");
    expect(reportPage).toContain("AcquisitionSurveyPanel");
    expect(adminPage).toContain("isAdminEmail");
    expect(adminPage).toContain("AdminAcquisitionPanel");
    expect(panel).toContain("고객 경험 설문");
    expect(panel).toContain("이용 후기 남기기");
    expect(panel).not.toMatch(/api\/account\/notifications|daily_flow_enabled/);
    expect(storage).toContain("encodeAcquisitionSurvey");
    expect(storage).toContain("decodeAcquisitionSurvey");
    expect(accountExport).toContain("decodeAcquisitionSurvey");
  });

  it("records consent boundaries, paid re-enable rules, export and deletion in the migration", async () => {
    const migration = await readFile(
      "supabase/migrations/20260825000100_daily_notifications_and_acquisition_surveys.sql",
      "utf8",
    );
    expect(migration).toContain("daily_notification_consent_at is not null");
    expect(migration).toContain("and paid_auto_enable");
    expect(migration).toContain("unique (owner_user_id, delivery_date, notification_type)");
    expect(migration).toContain("delete from public.daily_notification_deliveries");
    expect(migration).toContain("delete from public.report_acquisition_surveys");
    expect(migration).not.toMatch(/drop table|drop column/i);
  });
});
