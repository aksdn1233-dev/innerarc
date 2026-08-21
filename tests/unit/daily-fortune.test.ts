import { describe, expect, it } from "vitest";
import {
  DAILY_FORTUNE_STORAGE_KEY,
  clearDailyFortunePreference,
  createDailyFortune,
  isValidMonthDay,
  loadDailyFortunePreference,
  localDateKey,
  saveDailyFortunePreference,
  type DailyFortuneStorage,
} from "@/core/daily-fortune";

class MemoryStorage implements DailyFortuneStorage {
  readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

describe("daily fortune", () => {
  it("keeps a result stable for the same local date and changes from the date input", () => {
    const first = createDailyFortune({ birthMonth: 11, birthDay: 4, dateKey: "2026-08-21", locale: "ko" });
    const again = createDailyFortune({ birthMonth: 11, birthDay: 4, dateKey: "2026-08-21", locale: "ko" });
    const tomorrow = createDailyFortune({ birthMonth: 11, birthDay: 4, dateKey: "2026-08-22", locale: "ko" });

    expect(first).toEqual(again);
    expect(first).toMatchObject({ personalYear: 7, personalMonth: 6, personalDay: 9, guideId: "hoyeon" });
    expect(tomorrow.personalDay).toBe(1);
  });

  it("supports leap-day birthdays but rejects impossible month-day pairs", () => {
    expect(isValidMonthDay(2, 29)).toBe(true);
    expect(isValidMonthDay(2, 30)).toBe(false);
    expect(isValidMonthDay(4, 31)).toBe(false);
    expect(() => createDailyFortune({ birthMonth: 2, birthDay: 30, dateKey: "2026-08-21", locale: "ko" })).toThrow();
    expect(() => createDailyFortune({ birthMonth: 11, birthDay: 4, dateKey: "2026-02-30", locale: "ko" })).toThrow();
  });

  it("uses the device-local calendar date instead of UTC", () => {
    const date = new Date(2026, 7, 21, 23, 30);
    expect(localDateKey(date)).toBe("2026-08-21");
  });

  it("writes only after explicit enable and fails closed on corrupt storage", () => {
    const storage = new MemoryStorage();
    expect(loadDailyFortunePreference(storage)).toBeNull();
    saveDailyFortunePreference(storage, { version: 1, birthMonth: 11, birthDay: 4, enabledAt: "2026-08-21T00:00:00.000Z" });
    expect(loadDailyFortunePreference(storage)).toMatchObject({ birthMonth: 11, birthDay: 4 });

    storage.setItem(DAILY_FORTUNE_STORAGE_KEY, "{broken");
    expect(loadDailyFortunePreference(storage)).toBeNull();
    clearDailyFortunePreference(storage);
    expect(storage.getItem(DAILY_FORTUNE_STORAGE_KEY)).toBeNull();
  });

  it("keeps symbolic language bounded and avoids guarantees", () => {
    for (let day = 1; day <= 9; day += 1) {
      const result = createDailyFortune({ birthMonth: 1, birthDay: 1, dateKey: `2026-08-0${day}`, locale: "ko" });
      const copy = Object.values(result.copy).join(" ");
      expect(copy).not.toMatch(/반드시|확실히|보장|예언|진단|치료/);
    }
  });
});
