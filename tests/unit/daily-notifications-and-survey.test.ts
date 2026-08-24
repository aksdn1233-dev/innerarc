import { readFile } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACQUISITION_SOURCES,
  AcquisitionSurveySchema,
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
  it("accepts only the fixed source list and bounds the optional detail", () => {
    for (const source of ACQUISITION_SOURCES.filter((item) => item !== "other")) {
      expect(AcquisitionSurveySchema.parse({ source }).source).toBe(source);
    }
    expect(() => AcquisitionSurveySchema.parse({ source: "podcast" })).toThrow();
    expect(() => AcquisitionSurveySchema.parse({ source: "other", detail: "" })).toThrow();
    expect(() => AcquisitionSurveySchema.parse({ source: "other", detail: "가".repeat(81) })).toThrow();
  });

  it("keeps storage behind completed-report proof and the admin view behind its allowlist", async () => {
    const route = await readFile("src/app/api/surveys/acquisition/route.ts", "utf8");
    const reportPage = await readFile("src/app/[locale]/reports/[orderId]/page.tsx", "utf8");
    const adminPage = await readFile("src/app/[locale]/admin/page.tsx", "utf8");
    expect(route).toContain("authorizeReviewForOrder");
    expect(route).toContain("isSameOriginRequest");
    expect(reportPage).toContain("AcquisitionSurveyPanel");
    expect(adminPage).toContain("isAdminEmail");
    expect(adminPage).toContain("AdminAcquisitionPanel");
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
