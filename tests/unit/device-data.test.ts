import { describe, expect, it } from "vitest";
import {
  clearAllDeviceData,
  DEVICE_PREFERENCES_STORAGE_KEY,
  exportDeviceData,
  inspectDeviceData,
  isSupportedTimeZone,
  loadDevicePreferences,
  saveDevicePreferences,
  validateDevicePreferences,
  type DeviceStorage,
} from "@/core/privacy";
import { DAILY_FORTUNE_STORAGE_KEY, saveDailyFortunePreference } from "@/core/daily-fortune";
import { TAROT_HISTORY_STORAGE_KEY } from "@/core/tarot";
import { REALITY_CHECK_STORAGE_KEY } from "@/core/reality-check";

class MemoryStorage implements DeviceStorage {
  readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const now = "2026-07-22T12:00:00.000Z";
const preferences = {
  version: 1 as const,
  locale: "en" as const,
  timeZone: "Asia/Seoul",
  consents: {
    privacyRequired: true as const,
    aiPersonalization: true,
    modelTraining: false,
    productAnalytics: false,
    marketing: false,
    rawJournalRetention: false,
    acceptedAt: now,
    policyVersion: "privacy-1.0.0",
  },
  updatedAt: now,
};

describe("device privacy data", () => {
  it("accepts real IANA zones and rejects invented or oversized zones", () => {
    expect(isSupportedTimeZone("Asia/Seoul")).toBe(true);
    expect(isSupportedTimeZone("America/New_York")).toBe(true);
    expect(isSupportedTimeZone("Moon/Base")).toBe(false);
    expect(isSupportedTimeZone("x".repeat(101))).toBe(false);
    expect(() => validateDevicePreferences({ ...preferences, timeZone: "Moon/Base" })).toThrow();
  });

  it("writes only after an explicit save and round-trips independent consent", () => {
    const storage = new MemoryStorage();
    expect(loadDevicePreferences(storage)).toBeNull();
    expect(storage.values.size).toBe(0);

    saveDevicePreferences(storage, preferences);
    expect(loadDevicePreferences(storage)).toMatchObject({
      timeZone: "Asia/Seoul",
      consents: { aiPersonalization: true, modelTraining: false, marketing: false },
    });
    expect(inspectDeviceData(storage)).toEqual({
      preferences: 1,
      tarotReadings: 0,
      realityChecks: 0,
      dailyFortune: 0,
      total: 1,
    });
  });

  it("fails closed on corrupt preferences and ignores corrupt histories in export", () => {
    const storage = new MemoryStorage();
    storage.setItem(DEVICE_PREFERENCES_STORAGE_KEY, "{broken");
    storage.setItem(TAROT_HISTORY_STORAGE_KEY, "not-json");
    storage.setItem(REALITY_CHECK_STORAGE_KEY, JSON.stringify({ version: 99, records: [] }));

    expect(loadDevicePreferences(storage)).toBeNull();
    expect(inspectDeviceData(storage).total).toBe(0);
    const bundle = JSON.parse(exportDeviceData(storage, now));
    expect(bundle).toMatchObject({
      schemaVersion: "device-export-1.1.0",
      scope: "this_browser_device",
      data: { preferences: null, tarotReadings: [], realityChecks: [], dailyFortune: null },
    });
  });

  it("exports validated preferences and clears every owned device key", () => {
    const storage = new MemoryStorage();
    saveDevicePreferences(storage, preferences);
    saveDailyFortunePreference(storage, { version: 1, birthMonth: 11, birthDay: 4, enabledAt: now });
    const bundle = JSON.parse(exportDeviceData(storage, now));
    expect(bundle.data.preferences.timeZone).toBe("Asia/Seoul");
    expect(bundle.data.preferences.consents.modelTraining).toBe(false);
    expect(bundle.data.dailyFortune).toMatchObject({ birthMonth: 11, birthDay: 4 });

    storage.setItem(TAROT_HISTORY_STORAGE_KEY, "temporary");
    storage.setItem(REALITY_CHECK_STORAGE_KEY, "temporary");
    clearAllDeviceData(storage);
    expect(storage.getItem(DEVICE_PREFERENCES_STORAGE_KEY)).toBeNull();
    expect(storage.getItem(TAROT_HISTORY_STORAGE_KEY)).toBeNull();
    expect(storage.getItem(REALITY_CHECK_STORAGE_KEY)).toBeNull();
    expect(storage.getItem(DAILY_FORTUNE_STORAGE_KEY)).toBeNull();
    clearAllDeviceData(storage);
    expect(storage.values.size).toBe(0);
  });
});
