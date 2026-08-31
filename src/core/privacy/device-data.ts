import { z } from "zod";
import { ConsentStateSchema } from "./privacy";
import {
  TAROT_HISTORY_STORAGE_KEY,
  loadTarotHistory,
} from "@/core/tarot";
import {
  REALITY_CHECK_STORAGE_KEY,
  loadRealityChecks,
} from "@/core/reality-check";
import {
  DAILY_FORTUNE_STORAGE_KEY,
  loadDailyFortunePreference,
} from "@/core/daily-fortune";

export const DEVICE_PREFERENCES_STORAGE_KEY = "innerarc:privacy-preferences:v1";
export const DEVICE_EXPORT_SCHEMA_VERSION = "device-export-1.1.0";

export const DevicePreferencesSchema = z.object({
  version: z.literal(1),
  locale: z.enum(["ko", "en"]),
  timeZone: z.string().trim().min(1).max(100),
  consents: ConsentStateSchema,
  updatedAt: z.string().datetime({ offset: true }),
}).strict();

export type DevicePreferences = z.infer<typeof DevicePreferencesSchema>;

export interface DeviceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type DeviceDataCounts = Readonly<{
  preferences: number;
  tarotReadings: number;
  realityChecks: number;
  dailyFortune: number;
  total: number;
}>;

export function isSupportedTimeZone(value: string): boolean {
  const candidate = value.trim();
  if (!candidate || candidate.length > 100) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: candidate }).format();
    return true;
  } catch {
    return false;
  }
}

export function validateDevicePreferences(candidate: unknown): DevicePreferences {
  const preferences = DevicePreferencesSchema.parse(candidate);
  if (!isSupportedTimeZone(preferences.timeZone)) {
    throw new Error("Unsupported IANA time zone");
  }
  return preferences;
}

export function saveDevicePreferences(storage: DeviceStorage, candidate: unknown): DevicePreferences {
  const preferences = validateDevicePreferences(candidate);
  storage.setItem(DEVICE_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  return preferences;
}

export function loadDevicePreferences(storage: DeviceStorage): DevicePreferences | null {
  const raw = storage.getItem(DEVICE_PREFERENCES_STORAGE_KEY);
  if (!raw) return null;
  try {
    return validateDevicePreferences(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function inspectDeviceData(storage: DeviceStorage): DeviceDataCounts {
  const preferences = loadDevicePreferences(storage) ? 1 : 0;
  const tarotReadings = loadTarotHistory(storage).length;
  const realityChecks = loadRealityChecks(storage).length;
  const dailyFortune = loadDailyFortunePreference(storage) ? 1 : 0;
  return {
    preferences,
    tarotReadings,
    realityChecks,
    dailyFortune,
    total: preferences + tarotReadings + realityChecks + dailyFortune,
  };
}

export function exportDeviceData(storage: DeviceStorage, exportedAt: string): string {
  const validExportedAt = z.string().datetime({ offset: true }).parse(exportedAt);
  return JSON.stringify({
    product: "태령당",
    schemaVersion: DEVICE_EXPORT_SCHEMA_VERSION,
    exportedAt: validExportedAt,
    scope: "this_browser_device",
    data: {
      preferences: loadDevicePreferences(storage),
      tarotReadings: loadTarotHistory(storage),
      realityChecks: loadRealityChecks(storage),
      dailyFortune: loadDailyFortunePreference(storage),
    },
  }, null, 2);
}

export function clearAllDeviceData(storage: DeviceStorage): void {
  storage.removeItem(DEVICE_PREFERENCES_STORAGE_KEY);
  storage.removeItem(TAROT_HISTORY_STORAGE_KEY);
  storage.removeItem(REALITY_CHECK_STORAGE_KEY);
  storage.removeItem(DAILY_FORTUNE_STORAGE_KEY);
}
